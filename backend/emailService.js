const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1025, // Port SMTP par défaut de Mailpit
    ignoreTLS: true,
});

async function sendTaskAssignmentEmail(recipientEmail, taskDetails) {
    const mailOptions = {
        from: '"Täsk App" <notifications@task.akdigital.fr>',
        to: recipientEmail,
        subject: "Nouvelle tâche assignée",
        text: `Une nouvelle tâche vous a été assignée : ${taskDetails.text}`,
        html: `<p>Une nouvelle tâche vous a été assignée :</p>
             <h2>${taskDetails.text}</h2>
             <p>Priorité : ${taskDetails.priority}</p>
             <p>Date limite : ${taskDetails.deadline || 'Non spécifiée'}</p>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé : ', info.messageId);
        return info;
    } catch (error) {
        console.error('Erreur détaillée lors de l\'envoi de l\'email :', error);
        throw error; // Assurez-vous que l'erreur est bien propagée
    }
}
module.exports = { sendTaskAssignmentEmail };