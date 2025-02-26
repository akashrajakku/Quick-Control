const express= require("express");
const studentRouter= require("./student");
const hostRouter= require("./host");
const questionRouter = require("./question")
const router= express.Router();

router.use("/student", studentRouter);
router.use("/host", hostRouter);
router.use("/question", questionRouter);

module.exports= router;
