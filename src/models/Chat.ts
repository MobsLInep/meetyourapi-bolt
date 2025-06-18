import mongoose from 'mongoose';

interface IMessage {
  role: string;
  content?: string;
  imageUrl?: string;
  timestamp: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: function(this: IMessage) {
      return !this.imageUrl; // Content is required only if there's no image
    },
  },
  imageUrl: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Chat || mongoose.model('Chat', chatSchema); 