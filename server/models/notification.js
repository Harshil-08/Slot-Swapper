import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['swap-request', 'swap-accepted', 'swap-rejected'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, 
  { 
    timestamps: true 
  }
);

NotificationSchema.index({ read: 1, createdAt: 1 });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
