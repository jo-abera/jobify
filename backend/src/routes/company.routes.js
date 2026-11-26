const router = require("express").Router();
const companyController = require("../controllers/company.controller");

router.get("/", companyController.listCompanies);
router.get("/:slug", companyController.getCompanyBySlug);

module.exports = router;