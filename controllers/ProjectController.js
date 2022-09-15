import ProjectModel from '../models/Project.js';

export const getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectModel.find().exec();

    res.json({ projects, sort: 'default' });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить информацию о проектах',
    });
  }
};

export const getOneProject = async (req, res) => {
  console.log(req.params.id);
  try {
    const projectId = req.params.id;

    ProjectModel.find(
      {
        _id: projectId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось получить информацию о проекте',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Проект не найден',
          });
        }

        res.json(doc);
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось получить информацию о проекте',
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new ProjectModel({
      title: req.body.title,
      preview: req.body.preview,
      links: req.body.links,
      img: req.body.img,
      task: req.body.task,
      role: req.body.role,
      duration: req.body.duration,
      tags: req.body.tags,
    });

    const post = await doc.save();

    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось создать проект',
    });
  }
};
