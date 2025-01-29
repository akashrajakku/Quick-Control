const express= require("express");
const studentRouter= require("./student");
const hostRouter= require("./host");

const router= express.Router();

router.use("/student", studentRouter);
router.use("/host", hostRouter);

module.exports= router;
