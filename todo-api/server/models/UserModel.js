import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
})

/* Instance methods */
UserSchema.methods.generateAuthToken = function () {
  const user = this;
  const access = 'auth';
  const token = jwt.sign(JSON.stringify({ _id: user._id.toHexString(), access }), 'abc123').toString();

  user.tokens = user.tokens.concat([{
    access,
    token
  }]);

  return user.save().then(() => token);
}

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
}

/* Model methods */
UserSchema.statics.findByToken = function (token) {
  const User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject(e);
  }
  
  return User.findOne({ 
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
   });
}


UserSchema.pre('save', function(next) {
  const user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;