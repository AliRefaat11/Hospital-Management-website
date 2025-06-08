const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  
  // Contact Information
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid zip code']
    },
    country: {
      type: String,
      required: true,
      default: 'USA'
    }
  },
  
  // User Role and Permissions
  role: {
    type: String,
    required: true,
    enum: {
      values: ['admin', 'doctor', 'nurse', 'receptionist', 'patient', 'pharmacist'],
      message: 'Role must be one of: admin, doctor, nurse, receptionist, patient, pharmacist'
    }
  },
  
  // Professional Information (for staff)
  employeeId: {
    type: String,
    unique: true,
    sparse: true, // Only unique if not null
    match: [/^EMP\d{6}$/, 'Employee ID must follow format: EMP123456']
  },
  department: {
    type: String,
    enum: ['Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'General Medicine', 'Administration', 'Pharmacy'],
    required: function() {
      return ['doctor', 'nurse', 'admin', 'pharmacist'].includes(this.role);
    }
  },
  specialization: {
    type: String,
    required: function() {
      return this.role === 'doctor';
    }
  },
  licenseNumber: {
    type: String,
    required: function() {
      return ['doctor', 'nurse', 'pharmacist'].includes(this.role);
    },
    unique: true,
    sparse: true
  },
  
  // Patient-specific Information
  patientId: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^PAT\d{6}$/, 'Patient ID must follow format: PAT123456']
  },
  dateOfBirth: {
    type: Date,
    required: function() {
      return this.role === 'patient';
    }
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: function() {
      return this.role === 'patient';
    }
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: function() {
      return this.role === 'patient';
    }
  },
  emergencyContact: {
    name: {
      type: String,
      required: function() {
        return this.role === 'patient';
      }
    },
    relationship: {
      type: String,
      required: function() {
        return this.role === 'patient';
      }
    },
    phone: {
      type: String,
      required: function() {
        return this.role === 'patient';
      }
    }
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['Active', 'Resolved', 'Chronic'],
      default: 'Active'
    }
  }],
  allergies: [String],
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Authentication
  refreshToken: {
    type: String,
    select: false
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Timestamps
  lastLogin: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age (for patients)
userSchema.virtual('age').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to generate IDs
userSchema.pre('save', async function(next) {
  if (this.isNew) {
    if (this.role === 'patient' && !this.patientId) {
      const count = await mongoose.model('User').countDocuments({ role: 'patient' });
      this.patientId = `PAT${String(count + 1).padStart(6, '0')}`;
    } else if (['doctor', 'nurse', 'admin', 'receptionist', 'pharmacist'].includes(this.role) && !this.employeeId) {
      const count = await mongoose.model('User').countDocuments({ 
        role: { $in: ['doctor', 'nurse', 'admin', 'receptionist', 'pharmacist'] }
      });
      this.employeeId = `EMP${String(count + 1).padStart(6, '0')}`;
    }
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role,
      email: this.email 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: '30d' }
  );
};

// Static method to find by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to find doctors by department
userSchema.statics.findDoctorsByDepartment = function(department) {
  return this.find({ 
    role: 'doctor', 
    department, 
    isActive: true 
  }).select('firstName lastName specialization phone email');
};

// Static method to search users
userSchema.statics.searchUsers = function(searchTerm, role = null) {
  const query = {
    $and: [
      {
        $or: [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { employeeId: { $regex: searchTerm, $options: 'i' } },
          { patientId: { $regex: searchTerm, $options: 'i' } }
        ]
      },
      { isActive: true }
    ]
  };
  
  if (role) {
    query.$and.push({ role });
  }
  
  return this.find(query);
};

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ patientId: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ department: 1, role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;