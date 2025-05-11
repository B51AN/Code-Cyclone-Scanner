const express = require('express');
const multer = require('multer');
const fs = require('fs');
const eslint = require('eslint');
const validator = require('html-validator');
const router = express.Router();
const db = require('../db');

// File upload setup using multer
const upload = multer({ dest: 'uploads/' });

// Route to scan code or file and save results for a logged-in user
router.post('/scan', upload.single('file'), async (req, res) => {
    try {
        console.log('Request received:', req.body, req.file);

        // Ensure the user is logged in
        if (!req.session.user) {
            return res.status(401).send('Unauthorized: Please log in first.');
        }

        // Get file content
        const fileContent = req.file
            ? fs.readFileSync(req.file.path, 'utf-8')
            : req.body.code;

        if (!fileContent) {
            return res.status(400).json({ error: 'No code or file provided for scanning.' });
        }

        let issues = [];

        // Scan the file based on its extension (JavaScript or HTML)
        const extension = req.file ? req.file.mimetype : '';
        if (extension === 'application/javascript' || req.file.originalname.endsWith('.js')) {
            // JavaScript file scan using ESLint
            const cli = new eslint.ESLint();
            const results = await cli.lintText(fileContent);

            // Extract and format the issues from ESLint results
            issues = results[0].messages.map((msg) => ({
                line: msg.line,
                column: msg.column,
                severity: msg.severity === 2 ? 'error' : 'warning',
                message: msg.message,
            }));
        } else if (extension === 'text/html' || req.file.originalname.endsWith('.html')) {
            // HTML file scan using html-validator
            const result = await validator({
                data: fileContent,
                format: 'json',
                validator: 'https://validator.w3.org/nu/',
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });

            // Extract and format the issues from the HTML validator results
            issues = result.messages.map(msg => ({
                line: msg.lastLine || 'N/A',
                column: msg.lastColumn || 'N/A',
                severity: msg.type === 'error' ? 'error' : 'info',
                message: msg.message
            }));
        } else {
            return res.status(400).send('Unsupported file type. Only JavaScript (.js) and HTML (.html) files are allowed.');
        }

        // Save the scan results to the database
        const userId = req.session.user.id;
        const fileName = req.file ? req.file.originalname : 'Pasted Code';
        const createdAt = new Date();

        db.query(// 
            'INSERT INTO scan_results (user_id, file_name, issues, created_at) VALUES (?, ?, ?, ?)',
            [userId, fileName, JSON.stringify(issues), createdAt],
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Database error while saving scan results.');
                }

                // Clean up the uploaded file (if any)
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                res.json({ message: 'Scan completed and results saved successfully!', issues });
            }
        );
    } catch (err) {
        console.error('Error during scanning:', err);
        res.status(500).send('An error occurred during scanning.');
    }
});

// Route to get past scan results for logged-in user
router.get('/history', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authorized' });
    }

    const userId = req.session.user.id;

    db.query(
        'SELECT id, file_name, issues, created_at FROM scan_results WHERE user_id = ? ORDER BY created_at DESC',
        [userId],
        (err, results) => {
            if (err) {
                console.error('Error fetching scan history:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            res.json(results);
        }
    );
});

module.exports = router;
