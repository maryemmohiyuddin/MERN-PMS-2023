const teamController = require("../controllers/teamController");
const router = require("express").Router();
const { trainee, instructor } = require("../middleware")

router.post("/createTeam", teamController.createTeam);
router.get("/getAllTeams", teamController.getAllTeams);
router.get("/getAllMembers", teamController.getAllMembers);
router.get("/getUserMembers", teamController.getUserMembers);
router.get("/getTeamMembers", teamController.getTeamMembers);
router.get("/getTeamByProjectId", teamController.getTeamByProjectId);
router.delete("/deleteTeam", teamController.deleteTeam);





module.exports = router;

