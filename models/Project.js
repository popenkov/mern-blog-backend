import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  preview: {
    type: String,
    required: true,
    unique: true,
  },
  links: {
    type: Array,
    default: [],
  },
  img: {
    type: String,
    required: true,
    unique: true,
  },
  task: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
    unique: true,
  },
  duration: {
    type: String,
  },
  tags: {
    type: Array,
    default: [],
  },
});

export default mongoose.model('Project', ProjectSchema);
