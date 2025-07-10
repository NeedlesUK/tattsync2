const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

// Create a transporter object using SMTP transport
const createTransporter = () => {
  // For production, use actual SMTP credentials
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } 
  
  // For development, use ethereal.email (fake SMTP service)
  return new Promise((resolve, reject) => {
    nodemailer.createTestAccount()
      .then(testAccount => {
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        resolve(transporter);
      })
      .catch(error => {
        console.error('Failed to create test email account:', error);
        reject(error);
      });
  });
};

// Read email template and compile with Handlebars
const compileTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
  const source = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(source);
  return template(data);
};

// Send aftercare email to client
const sendAftercareEmail = async (clientEmail, clientName, artistName, artistEmail) => {
  try {
    const transporter = await createTransporter();
    
    // Prepare template data
    const templateData = {
      clientName,
      clientEmail,
      artistName,
      artistEmail,
      currentYear: new Date().getFullYear()
    };
    
    // Compile email template
    const htmlContent = compileTemplate('aftercareEmail', templateData);
    
    // Send email
    const info = await transporter.sendMail({
      from: `"TattSync" <${process.env.EMAIL_FROM || 'noreply@tattsync.com'}>`,
      to: clientEmail,
      subject: 'Your Tattoo Aftercare Guide',
      html: htmlContent
    });
    
    console.log('Aftercare email sent successfully');
    
    // For development, log the URL where the message can be previewed
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending aftercare email:', error);
    throw error;
  }
};

// Send consent form confirmation email
const sendConsentConfirmationEmail = async (clientEmail, clientName, artistName, formData) => {
  try {
    const transporter = await createTransporter();
    
    // Send email
    const info = await transporter.sendMail({
      from: `"TattSync" <${process.env.EMAIL_FROM || 'noreply@tattsync.com'}>`,
      to: clientEmail,
      subject: 'Your Consent Form Submission',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6b21a8; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">TattSync</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Consent Form Confirmation</h2>
            <p>Hello ${clientName},</p>
            <p>Thank you for completing your consent form with ${artistName}. Your form has been submitted successfully.</p>
            <p>You will receive your aftercare instructions separately.</p>
            <p>If you have any questions, please contact your artist directly.</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>&copy; ${new Date().getFullYear()} TattSync. All rights reserved.</p>
          </div>
        </div>
      `
    });
    
    console.log('Consent confirmation email sent successfully');
    
    // For development, log the URL where the message can be previewed
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending consent confirmation email:', error);
    throw error;
  }
};

// Get aftercare template from database
const getAftercareTemplate = async (procedureType, supabase) => {
  try {
    if (!supabase) {
      throw new Error('Database connection not available');
    }
    
    const { data, error } = await supabase
      .from('aftercare_templates')
      .select('*')
      .eq('procedure_type', procedureType)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      console.error('Error fetching aftercare template:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting aftercare template:', error);
    return null;
  }
};

// Send aftercare email using template from database
const sendAftercareEmailWithTemplate = async (clientEmail, clientName, artistName, artistEmail, procedureType, supabase) => {
  try {
    const transporter = await createTransporter();
    
    // Get template from database
    const template = await getAftercareTemplate(procedureType, supabase);
    
    // Prepare template data
    const templateData = {
      clientName,
      clientEmail,
      artistName,
      artistEmail,
      currentYear: new Date().getFullYear()
    };
    
    // Process HTML content with Handlebars
    let htmlContent;
    if (template && template.html_content) {
      // Compile the template from the database
      const compiledTemplate = handlebars.compile(template.html_content);
      htmlContent = compiledTemplate(templateData);
    } else {
      // Fallback to default template
      htmlContent = compileTemplate('aftercareEmail', templateData);
    }
    
    // Send email
    const info = await transporter.sendMail({
      from: `"TattSync" <${process.env.EMAIL_FROM || 'noreply@tattsync.com'}>`,
      to: clientEmail,
      subject: template ? template.title : 'Your Aftercare Guide',
      html: htmlContent
    });
    
    console.log('Aftercare email sent successfully');
    
    // For development, log the URL where the message can be previewed
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending aftercare email with template:', error);
    throw error;
  }
};

module.exports = {
  sendAftercareEmail,
  sendConsentConfirmationEmail,
  sendAftercareEmailWithTemplate,
  getAftercareTemplate
};