const projectController = require("../controllers/projectController");
const router = require("express").Router();

router.post("/createProject", projectController.createProject);
router.get("/getAllProjects", projectController.getAllProjects);
router.put("/updateProject", projectController.updateProject);
router.get("/getInsProjects", projectController.getInsProjects);
router.get("/getUserProjects", projectController.getUserProject);
router.delete("/deleteProject", projectController.deleteProject);



module.exports = router;

