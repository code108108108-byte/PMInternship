const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'how mongodb://127.0.0.1:27017/pm-internship-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB successfully');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  aadhaarNumber: { type: String, required: true },
  password: { type: String, required: true },
  bankAccountStatus: { type: String, default: 'pending' },
  insuranceStatus: { type: String, default: 'incomplete' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Insurance Schema
const insuranceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  policyNumber: { type: String, required: true },
  status: { type: String, default: 'pending' },
  documents: [String],
  createdAt: { type: Date, default: Date.now }
});

const Insurance = mongoose.model('Insurance', insuranceSchema);

// Routes

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, aadhaarNumber, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      aadhaarNumber,
      password: hashedPassword
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        insuranceStatus: user.insuranceStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        insuranceStatus: user.insuranceStatus,
        bankAccountStatus: user.bankAccountStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete Insurance Process
app.post('/api/complete-insurance', async (req, res) => {
  try {
    const { userId, policyNumber } = req.body;

    // Update user insurance status
    await User.findByIdAndUpdate(userId, { insuranceStatus: 'completed' });

    // Create insurance record
    const insurance = new Insurance({
      userId,
      policyNumber,
      status: 'active'
    });

    await insurance.save();

    res.json({ message: 'Insurance process completed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User Dashboard Data
app.get('/api/dashboard/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const insurance = await Insurance.findOne({ userId: user._id });

    res.json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        insuranceStatus: user.insuranceStatus,
        bankAccountStatus: user.bankAccountStatus
      },
      insurance: insurance || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify Bank Account Status
app.post('/api/verify-bank-account', async (req, res) => {
  try {
    const { userId, aadhaarNumber } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simulate bank account verification
    const isVerified = user.aadhaarNumber === aadhaarNumber;
    
    if (isVerified) {
      await User.findByIdAndUpdate(userId, { bankAccountStatus: 'verified' });
      res.json({ message: 'Bank account verified successfully', status: 'verified' });
    } else {
      res.json({ message: 'Bank account verification failed', status: 'failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete User Account
app.delete('/api/delete-user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete related insurance records first
    await Insurance.deleteMany({ userId: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ 
      message: 'User account deleted successfully',
      deletedUser: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Internship Recommendations Schema
const internshipPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  technicalSkills: [String],
  softSkills: [String],
  preferredCities: [String],
  workMode: String,
  sectorInterest: [String],
  educationLevel: String,
  fieldOfStudy: String,
  cgpa: Number,
  duration: String,
  stipend: String,
  createdAt: { type: Date, default: Date.now }
});

const InternshipPreference = mongoose.model('InternshipPreference', internshipPreferenceSchema);

// Internship Schema (for storing available internships)
const internshipSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  duration: String,
  stipend: String,
  description: String,
  requiredSkills: [String],
  sector: String,
  workMode: String,
  educationLevel: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Internship = mongoose.model('Internship', internshipSchema);

// Get Internship Recommendations
app.post('/api/internship-recommendations', async (req, res) => {
  try {
    const preferences = req.body;
    
    // Save user preferences if logged in
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
      const userId = decoded.userId;
      
      // Save or update preferences
      await InternshipPreference.findOneAndUpdate(
        { userId: userId },
        { ...preferences, userId: userId },
        { upsert: true, new: true }
      );
    }
    
    // Get matching internships
    const recommendations = await getInternshipRecommendations(preferences);
    
    res.json({
      message: 'Recommendations generated successfully',
      recommendations: recommendations
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Recommendation Algorithm
async function getInternshipRecommendations(preferences) {
  // Sample internship data (in real app, this would come from database)
  const sampleInternships = [
    {
      id: '1',
      title: 'Software Development Intern',
      company: 'TechCorp India',
      location: 'Bangalore',
      duration: '3 Months',
      stipend: '₹15,000/month',
      description: 'Work on cutting-edge web applications using React and Node.js',
      requiredSkills: ['programming', 'web-development', 'database'],
      sector: 'technology',
      workMode: 'hybrid',
      educationLevel: 'bachelor'
    },
    {
      id: '2',
      title: 'Data Science Intern',
      company: 'DataAnalytics Pvt Ltd',
      location: 'Mumbai',
      duration: '6 Months',
      stipend: '₹20,000/month',
      description: 'Analyze large datasets and build machine learning models',
      requiredSkills: ['data-analysis', 'machine-learning', 'programming'],
      sector: 'technology',
      workMode: 'remote',
      educationLevel: 'bachelor'
    },
    {
      id: '3',
      title: 'Marketing Intern',
      company: 'Digital Marketing Solutions',
      location: 'Delhi',
      duration: '2 Months',
      stipend: '₹10,000/month',
      description: 'Create digital marketing campaigns and social media content',
      requiredSkills: ['communication', 'creativity', 'analytical-thinking'],
      sector: 'media',
      workMode: 'onsite',
      educationLevel: 'bachelor'
    },
    {
      id: '4',
      title: 'Finance Intern',
      company: 'Investment Bank Ltd',
      location: 'Mumbai',
      duration: '3 Months',
      stipend: '₹25,000/month',
      description: 'Assist in financial analysis and investment research',
      requiredSkills: ['analytical-thinking', 'problem-solving', 'communication'],
      sector: 'finance',
      workMode: 'onsite',
      educationLevel: 'bachelor'
    },
    {
      id: '5',
      title: 'Cybersecurity Intern',
      company: 'SecureTech Solutions',
      location: 'Hyderabad',
      duration: '4 Months',
      stipend: '₹18,000/month',
      description: 'Learn about network security and threat analysis',
      requiredSkills: ['cybersecurity', 'networking', 'problem-solving'],
      sector: 'technology',
      workMode: 'hybrid',
      educationLevel: 'bachelor'
    }
  ];
  
  // Calculate match scores for each internship
  const scoredInternships = sampleInternships.map(internship => {
    let score = 0;
    const matchingSkills = [];
    
    // Check skill matches
    const userSkills = [...preferences.technicalSkills, ...preferences.softSkills];
    internship.requiredSkills.forEach(skill => {
      if (userSkills.includes(skill)) {
        score += 10;
        matchingSkills.push(skill);
      }
    });
    
    // Check location match
    if (preferences.preferredCities.includes(internship.location.toLowerCase()) || 
        preferences.preferredCities.includes('any')) {
      score += 5;
    }
    
    // Check work mode match
    if (preferences.workMode === internship.workMode || preferences.workMode === 'any') {
      score += 3;
    }
    
    // Check sector match
    if (preferences.sectorInterest.includes(internship.sector)) {
      score += 5;
    }
    
    // Check education level match
    if (preferences.educationLevel === internship.educationLevel) {
      score += 2;
    }
    
    return {
      ...internship,
      score: score,
      matchingSkills: matchingSkills
    };
  });
  
  // Sort by score and return top recommendations
  return scoredInternships
    .filter(internship => internship.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Return top 5 recommendations
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
