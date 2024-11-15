const router = require("express").Router();
const {
	sendDescriptionMentionEmail,
	sendTaskAssignmentEmail,
	sendProjectAssignmentEmail,
	sendResponseMentionEmail,
} = require("../emailService");

router.post("/test-email", async (req, res) => {
	console.log("Requête de test d'email reçue");
	try {
		const recipientEmail = req.body.recipientEmail;

		if (!recipientEmail) {
			return res
				.status(400)
				.send({ message: "Veuillez spécifier un email de test" });
		}

		const testTaskDetails = {
			text: "Ceci est un email de test",
			priority: "Haute",
			deadline: new Date().toISOString().split("T")[0],
		};
		console.log("Envoi de l'email de test...");
		const response = await sendTaskAssignmentEmail(
			recipientEmail,
			testTaskDetails
		);
		console.log(response);
		console.log("Email de test envoyé avec succès");
		res.status(200).send({ message: "Email de test envoyé avec succès" });
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email de test:", error);
		res
			.status(500)
			.send({ error: "Erreur lors de l'envoi de l'email de test" });
	}
});

router.post("/notify-project-assignment", async (req, res) => {
	const { recipientEmail, projectDetails } = req.body;
	try {
		await sendProjectAssignmentEmail(recipientEmail, projectDetails);
		res
			.status(200)
			.json({ message: "Email de notification envoyé avec succès" });
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email de notification:", error);
		res
			.status(500)
			.json({ error: "Erreur lors de l'envoi de l'email de notification" });
	}
});

router.post("/notify-task-assignment", async (req, res) => {
	const { recipientEmail, taskDetails } = req.body;
	try {
		await sendTaskAssignmentEmail(recipientEmail, taskDetails);
		res
			.status(200)
			.json({ message: "Email de notification envoyé avec succès" });
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email de notification:", error);
		res
			.status(500)
			.json({ error: "Erreur lors de l'envoi de l'email de notification" });
	}
});

router.post("/notify-description-mention", async (req, res) => {
	try {
		const { mentionnedUsers, taskDetails } = req.body;
		const emails = [];

		for (const mentionnedUser of mentionnedUsers) {
			emails.push(mentionnedUser?.email);
		}

		await sendDescriptionMentionEmail(emails, taskDetails);

		res
			.status(200)
			.json({ message: "Email de notification envoyé avec succès" });
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email de notification:", error);
		res
			.status(500)
			.json({ error: "Erreur lors de l'envoi de l'email de notification" });
	}
});

router.post("/notify-response-mention", async (req, res) => {
	try {
		const { mentionnedUsers, taskDetails } = req.body;
		const emails = [];

		for (const mentionnedUser of mentionnedUsers) {
			emails.push(mentionnedUser?.email);
		}

		await sendResponseMentionEmail(emails, taskDetails);

		res
			.status(200)
			.json({ message: "Email de notification envoyé avec succès" });
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email de notification:", error);
		res
			.status(500)
			.json({ error: "Erreur lors de l'envoi de l'email de notification" });
	}
});

module.exports = router;
