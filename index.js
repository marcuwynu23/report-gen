#!/usr/bin/env node

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { Command } = require("commander");
const program = new Command();

function checkIfGitRepo() {
  // Check if the current directory contains a .git directory
  const gitDir = path.join(process.cwd(), ".git");
  if (!fs.existsSync(gitDir)) {
    console.error("Error: This directory is not a Git repository.");
    process.exit(1); // Exit the process with an error code
  }
}

function generateLogReport(author, date) {
  checkIfGitRepo(); // Check if it's a Git repository

  const since = `${date} 00:00:00`;
  const until = `${date} 23:59:59`;

  const gitCommand = `git log --oneline --author="${author}" --since="${since}" --until="${until}"`;

  exec(gitCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing git command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }

    const logLines = stdout
      .split("\n")
      .filter((line) => line.trim() !== "") // Remove empty lines
      .map((line) => {
        const parts = line.split(" ");
        parts[0] = "-"; // Replace the commit ID with '-'
        return parts.join(" ");
      });

    const reportContent = logLines.join("\n");

    const filename = `log_report_${date}.txt`;
    fs.writeFile(filename, reportContent, (err) => {
      if (err) {
        console.error(`Error writing to file: ${err.message}`);
      } else {
        console.log(`Log report saved as ${filename}`);
      }
    });
  });
}

// Define command-line options using commander
program
  .version("1.0.0")
  .description("Generate a log report from Git log.")
  .requiredOption("--author <author>", "Specify the author")
  .requiredOption("--date <date>", "Specify the date in YYYY-MM-DD format")
  .parse(process.argv);

const options = program.opts();

generateLogReport(options.author, options.date);
