import Event from '../models/event.js';
import SwapRequest from '../models/swapRequest.js';
import { emitToUser } from '../server.js';

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

    emitToUser(theirSlot.owner._id, 'swap-request-received', {
      swapRequest,
      message: `${req.user.name || 'Someone'} wants to swap slots with you`,
    });

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

      emitToUser(requesterId, 'swap-request-accepted', {
        swapRequest,
        message: `${swapRequest.responder.name} accepted your swap request!`,
      });
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

      emitToUser(swapRequest.requester._id, 'swap-request-rejected', {
        swapRequest,
        message: `${swapRequest.responder.name} rejected your swap request`,
      });
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
