const mongoosePaginate = require('mongoose-paginate');
const mongoose = require('../../database');
const user = require('../User');

const NewsSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    news: {
        type: String,
        require: true,
    },
    resume: {
        type: String,
        require: true,
        lowercase: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: user,
        require: true,
    },
    autor: {
        type: String,
        require: true,
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
});

NewsSchema.plugin(mongoosePaginate);

const news = mongoose.model('News', NewsSchema);
module.exports = news;
