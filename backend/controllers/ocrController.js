const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const CustomerId = require('../models/CustomerId');

// Path to the directory containing vie.traineddata
// (file lives at: backend/vie.traineddata)
const LANG_PATH = path.join(__dirname, '..');

const extractIdInfo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an ID image (req.file is undefined)' });
  }

  try {
    const imagePath = req.file.path;
    console.log('[OCR] Starting extraction for:', imagePath);

    const worker = await Tesseract.createWorker('vie', 1, {
      langPath: LANG_PATH,
      logger: (m) => {
        if (process.env.NODE_ENV !== 'production' && m.status === 'recognizing text') {
          console.log(`[Tesseract] Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const { data: { text } } = await worker.recognize(imagePath);
    await worker.terminate();

    console.log('[OCR] Raw text extracted (first 100 chars):', text.substring(0, 100).replace(/\n/g, ' '));


    // IMPROVED parsing for Vietnamese CCCD
    // 1. Extract ID: Look for any sequence of 12 digits
    const idMatch = text.match(/\d{12}/);
    
    // 2. Extract Name: Look for patterns after 'Ho va ten' or 'Full name'
    let fullName = 'KHÔNG XÁC ĐỊNH';
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    
    // Look for lines that are ALL CAPS (common for names on CCCD)
    // and exclude common labels
    const likelyNames = lines.filter(l => 
      /^[A-ZẮẰẲẴẶÁÀẢÃẠÊẾỀỂỄỆÍÌỈĨỊÔỐỒỔỖỘƠỚỜỞỠỢƯỨỪỬỮỰĐ ]+$/.test(l.toUpperCase()) &&
      !/SỐ|NO|NAME|HỌ VÀ TÊN|CCCD|SOCIALIST/i.test(l) &&
      l.split(' ').length >= 2
    );

    if (likelyNames.length > 0) {
      fullName = likelyNames[0];
    }

    // 3. Extract DOB: Look for DD/MM/YYYY pattern
    const dobMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);

    // Prepare data
    const id_num = idMatch ? idMatch[0] : `UNKNOWN_${req.user.id}`;
    const extractedData = {
      user_id: req.user.id,
      full_name: fullName.toUpperCase().trim(),
      id_number: id_num,
      dob: dobMatch ? dobMatch[1].split('/').reverse().join('-') : null,
      id_image_url: req.file.filename,
    };

    console.log('[OCR Result Parsed]', extractedData);

    // Update if exists, else create
    let customerId;
    try {
      customerId = await CustomerId.findOne({ where: { user_id: req.user.id } });
      if (customerId) {
        await customerId.update(extractedData);
      } else {
        customerId = await CustomerId.create(extractedData);
      }
    } catch (dbErr) {
      console.error('[OCR DB Error Details]', {
        name: dbErr.name,
        message: dbErr.message,
        errors: dbErr.errors?.map(e => ({ type: e.type, message: e.message, path: e.path }))
      });
      if (dbErr.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          message: 'Số CCCD này đã được đăng ký bởi hệ thống. Vui lòng liên hệ quản trị viên.',
          error: dbErr.errors[0]?.message 
        });
      }
      throw dbErr;
    }

    res.json({
      message: 'OCR extraction successful',
      extracted_data: customerId,
      raw_text: text,
    });

    // Cleanup temp file after response is sent
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Failed to delete temp file:', err.message);
    });

  } catch (error) {
    console.error('[OCR Error]', error);
    res.status(500).json({ message: error.message });
  }
};

const getStatus = async (req, res) => {
  try {
    const customerId = await CustomerId.findOne({ where: { user_id: req.user.id } });
    res.json({
      isVerified: !!customerId,
      data: customerId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { extractIdInfo, getStatus };
