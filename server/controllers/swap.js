import Event from '../models/event.js';
import SwapRequest from '../models/swapRequest.js';
import Notification from '../models/notification.js';
import { emitToUser } from '../socket.js';

const createNotification = async (recipientId, type, message, data) => {
  const notification = await Notification.create({
    recipient: recipientId,
    type,
    message,
    data
  });
  
  emitToUser(recipientId, type, {
    ...data,
    message,
    notificationId: notification._id
  });
  
  return notification;
};

export const getSwappableSlots = async (req, res) => {
  try {
    const userId = req.user.id;

    const swappableSlots = await Event.find({
      status: 'SWAPPABLE',
      owner: { $ne: userId },
    })
      .populate('owner', 'name email')
      .sort({ startTime: 1 });

    return res.status(200).json({
      slots: swappableSlots,
      success: true,
    });
  } catch (error) {
    console.error('Get swappable slots error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      success: false 
    });
  }
};

export const createSwapRequest = async (req, res) => {
  try {
    const { mySlotId, theirSlotId } = req.body;
    const userId = req.user.id;

    if (!mySlotId || !theirSlotId) {
      return res.status(400).json({ 
        message: 'Both slot IDs are required',
        success: false 
      });
    }

    const mySlot = await Event.findOne({ 
      _id: mySlotId, 
      owner: userId 
    });

    if (!mySlot) {
      return res.status(404).json({ 
        message: 'Your slot not found',
        success: false 
      });
    }

    if (mySlot.status !== 'SWAPPABLE') {
      return res.status(400).json({ 
        message: 'Your slot must be marked as swappable',
        success: false 
      });
    }

    const theirSlot = await Event.findById(theirSlotId).populate('owner', 'name email');

    if (!theirSlot) {
      return res.status(404).json({ 
        message: 'Requested slot not found',
        success: false 
      });
    }

    if (theirSlot.status !== 'SWAPPABLE') {
      return res.status(400).json({ 
        message: 'Requested slot is no longer swappable',
        success: false 
      });
    }

    if (theirSlot.owner._id.toString() === userId) {
      return res.status(400).json({ 
        message: 'Cannot swap with your own slot',
        success: false 
      });
    }

    const existingRequest = await SwapRequest.findOne({
      $or: [
        { mySlot: mySlotId, status: 'PENDING' },
        { theirSlot: mySlotId, status: 'PENDING' },
        { mySlot: theirSlotId, status: 'PENDING' },
        { theirSlot: theirSlotId, status: 'PENDING' },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'One of these slots already has a pending swap request',
        success: false 
      });
    }

    const swapRequest = await SwapRequest.create({
      requester: userId,
      responder: theirSlot.owner._id,
      mySlot: mySlotId,
      theirSlot: theirSlotId,
      status: 'PENDING',
    });

    await Event.updateOne({ _id: mySlotId }, { status: 'SWAP_PENDING' });
    await Event.updateOne({ _id: theirSlotId }, { status: 'SWAP_PENDING' });

    await swapRequest.populate([
      { path: 'requester', select: 'name email' },
      { path: 'responder', select: 'name email' },
      { path: 'mySlot' },
      { path: 'theirSlot' },
    ]);

    await createNotification(
      theirSlot.owner._id,
      'swap-request',
      `${req.user.name || 'Someone'} wants to swap slots with you`,
      { swapRequest }
    );

    return res.status(201).json({
      message: 'Swap request sent successfully',
      swapRequest,
      success: true,
    });
  } catch (error) {
    console.error('Create swap request error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      success: false 
    });
  }
};

export const respondToSwapRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { accept } = req.body;
    const userId = req.user.id;

    if (typeof accept !== 'boolean') {
      return res.status(400).json({ 
        message: 'Accept field is required (true/false)',
        success: false 
      });
    }

    const swapRequest = await SwapRequest.findById(requestId)
      .populate('requester', 'name email')
      .populate('responder', 'name email')
      .populate('mySlot')
      .populate('theirSlot');

    if (!swapRequest) {
      return res.status(404).json({ 
        message: 'Swap request not found',
        success: false 
      });
    }

    if (swapRequest.responder._id.toString() !== userId) {
      return res.status(403).json({ 
        message: 'Not authorized to respond to this request',
        success: false 
      });
    }

    if (swapRequest.status !== 'PENDING') {
      return res.status(400).json({ 
        message: 'This swap request has already been processed',
        success: false 
      });
    }

    if (accept) {
      const mySlotId = swapRequest.mySlot._id;
      const theirSlotId = swapRequest.theirSlot._id;
      const requesterId = swapRequest.requester._id;
      const responderId = swapRequest.responder._id;

      await Event.updateOne(
        { _id: mySlotId },
        { owner: responderId, status: 'BUSY' }
      );
      
      await Event.updateOne(
        { _id: theirSlotId },
        { owner: requesterId, status: 'BUSY' }
      );

      swapRequest.status = 'ACCEPTED';

      await createNotification(
        requesterId,
        'swap-accepted',
        `${swapRequest.responder.name} accepted your swap request!`,
        { swapRequest }
      );
    } else {
      await Event.updateOne(
        { _id: swapRequest.mySlot._id },
        { status: 'SWAPPABLE' }
      );
      
      await Event.updateOne(
        { _id: swapRequest.theirSlot._id },
        { status: 'SWAPPABLE' }
      );

      swapRequest.status = 'REJECTED';

      await createNotification(
        swapRequest.requester._id,
        'swap-rejected',
        `${swapRequest.responder.name} rejected your swap request`,
        { swapRequest }
      );
    }

    await swapRequest.save();

    return res.status(200).json({
      message: accept ? 'Swap accepted successfully' : 'Swap rejected',
      swapRequest,
      success: true,
    });
  } catch (error) {
    console.error('Respond to swap error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      success: false 
    });
  }
};

export const getMySwapRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const incoming = await SwapRequest.find({
      responder: userId,
      status: 'PENDING',
    })
      .populate('requester', 'name email')
      .populate('mySlot')
      .populate('theirSlot')
      .sort({ createdAt: -1 });

    const outgoing = await SwapRequest.find({
      requester: userId,
    })
      .populate('responder', 'name email')
      .populate('mySlot')
      .populate('theirSlot')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      incoming,
      outgoing,
      success: true,
    });
  } catch (error) {
    console.error('Get swap requests error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      success: false 
    });
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ 
      recipient: userId 
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    return res.status(200).json({
      notifications,
      unreadCount,
      success: true,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      success: false 
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({ 
        message: 'Notification not found',
        success: false 
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    return res.status(200).json({
      message: 'Notification marked as read',
      success: true,
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      success: false 
    });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true, readAt: new Date() }
    );

    return res.status(200).json({
      message: 'All notifications marked as read',
      success: true,
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      success: false 
    });
  }
};
