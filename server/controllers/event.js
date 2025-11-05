import Event from '../models/event.js';

export const createEvent = async (req, res) => {
  try {
    const { title, startTime, endTime, status } = req.body;
    const userId = req.user.id;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Title, start time, and end time are required',
        success: false 
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (start >= end) {
      return res.status(400).json({ 
        message: 'End time must be after start time',
        success: false 
      });
    }

    const event = await Event.create({
      title,
      startTime: start,
      endTime: end,
      owner: userId,
      status: status || 'BUSY',
    });

    return res.status(201).json({
      message: 'Event created successfully',
      event,
      success: true,
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      success: false 
    });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const events = await Event.find({ owner: userId })
      .sort({ startTime: 1 });

    return res.status(200).json({
      events,
      success: true,
    });
  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      success: false 
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, startTime, endTime } = req.body;

    const event = await Event.findOne({ _id: id, owner: userId });

    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found',
        success: false 
      });
    }

    if (event.status === 'SWAP_PENDING') {
      return res.status(400).json({ 
        message: 'Cannot update event with pending swap',
        success: false 
      });
    }

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (start >= end) {
        return res.status(400).json({ 
          message: 'End time must be after start time',
          success: false 
        });
      }
    }

    if (title) event.title = title;
    if (startTime) event.startTime = new Date(startTime);
    if (endTime) event.endTime = new Date(endTime);

    await event.save();

    return res.status(200).json({
      message: 'Event updated successfully',
      event,
      success: true,
    });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      success: false 
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findOne({ _id: id, owner: userId });

    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found',
        success: false 
      });
    }

    if (event.status === 'SWAP_PENDING') {
      return res.status(400).json({ 
        message: 'Cannot delete event with pending swap',
        success: false 
      });
    }

    await Event.deleteOne({ _id: id });

    return res.status(200).json({
      message: 'Event deleted successfully',
      success: true,
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      success: false 
    });
  }
};

export const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['BUSY', 'SWAPPABLE'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be BUSY or SWAPPABLE',
        success: false 
      });
    }

    const event = await Event.findOne({ _id: id, owner: userId });

    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found',
        success: false 
      });
    }

    if (event.status === 'SWAP_PENDING') {
      return res.status(400).json({ 
        message: 'Cannot change status while swap is pending',
        success: false 
      });
    }

    event.status = status;
    await event.save();

    return res.status(200).json({
      message: 'Event status updated successfully',
      event,
      success: true,
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      success: false 
    });
  }
};
