import emailjs from '@emailjs/browser';
import { toast } from 'react-hot-toast';

// REPLACE THESE WITH YOUR ACTUAL EMAILJS KEYS
// Sign up at https://www.emailjs.com/
const SERVICE_ID = "service_s8mx58d"; 
const TEMPLATE_ID = "template_qnra9kd"; 
const PUBLIC_KEY = "Cjfa748WLaejQN-2j";   

export const sendNotificationEmail = async (toEmail, toName, itemTitle, itemUrl) => {
    try {
        if (SERVICE_ID === "service_id_placeholder") {
             console.warn("EmailJS KEYS MISSING. Using fallback mailto.");
             return false;
        }

        const templateParams = {
            to_email: toEmail,
            to_name: toName || "User",
            from_name: "FindIt AI",
            message: `Good news! Someone has submitted a potential match for your item: ${itemTitle}. Click here to view: ${itemUrl}`,
            reply_to: "noreply@findit.ai"
        };
        
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        return true;
    } catch (error) {
        console.error("Email send failed:", error);
        return false;
    }
};
