const supabase = require('../supabase');
const { cloudinary } = require('../cloudinary');
const multer = require('multer');
const { storage } = require('../cloudinary');

// Setup multer middleware
const upload = multer({ storage });
exports.uploadMiddleware = upload.array('images'); // Use in route

// POST /api/locations/upload-location
exports.createLocation = async (req, res) => {
  try {
    const { name, description, location } = req.body;
    const imageFiles = req.files;

    if (!name || !description || !location || !imageFiles || imageFiles.length === 0) {
      return res.status(400).json({
        message: 'Please provide name, description, location, and at least one image.',
      });
    }

    // Extract image URLs from Cloudinary uploads
    const imageUrls = imageFiles.map((file) => file.path);

    // Insert into Supabase
    const { data, error } = await supabase
      .from('locations')
      .insert([{ name, description, location, images: imageUrls }])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ message: 'Failed to insert location', error });
    }

    res.status(201).json({
      message: 'Location created successfully',
      location: data[0],
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/locations
exports.getLocations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, description, location, images');

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ message: 'Failed to fetch locations', error });
    }

    res.status(200).json({ locations: data });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
