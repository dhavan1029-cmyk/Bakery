import settingsModel from "../models/settingsModel.js";

export async function loadSettings(req, res, next) {

    try {

        req.settings = await settingsModel
            .findOne()
            .lean();

        next();

    } catch (err) {

        next(err);

    }

}