import mongoose from 'mongoose';

const SwapRequestSchema = new mongoose.Schema({
	requester: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	responder: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	mySlot: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Event',
		required: true
	},
	theirSlot: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Event',
		required: true
	},
	status: {
		type: String,
		enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
		default: 'PENDING'
	}
}, 
	{ 
		timestamps: true 
	}
);

const SwapRequest = mongoose.model('SwapRequest', SwapRequestSchema);
export default SwapRequest;
