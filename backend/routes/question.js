const express = require("express");
const { Question } = require("../db");
const router = express.Router();
const zod = require("zod");

// Zod schema for question validation
const questionSchema = zod.object({
    question: zod.string().min(5, "Question must be at least 5 characters long"),
    options: zod.object({
        A: zod.string().min(1),
        B: zod.string().min(1),
        C: zod.string().min(1),
        D: zod.string().min(1),
    }),
    correctOption: zod.enum(["A", "B", "C", "D"]),
    points: zod.number().int().positive("Points must be a positive integer"),
});

// Add question endpoint
router.post("/add-question", async (req, res) => {
    try {
        console.log("Received Request:", req.body); // Debugging log
        const validationResult = questionSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: validationResult.error.errors,
            });
        }

        const { question, options, correctOption, points} = req.body;

        const newQuestion = await Question.create({
            question,
            options,
            correctOption,
            points,
        });

        res.status(201).json({
            message: "Question added successfully",
            question: newQuestion,
        });
    } catch (error) {
        console.error("Error adding question:", error);
        res.status(500).json({
            message: "Internal server error",
            details: error.message,
        });
    }
});

module.exports = router;
