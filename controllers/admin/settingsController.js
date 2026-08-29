import settingsModel from "../../models/settingsModel.js"


export async function renderAdminSettings(req, res) {

    try {

        // For now, until you create a settings model
        const settings = await settingsModel.findOne({})

        res.render('admin/adminSettings', {
            admin: req.admin,
            settings,
            error: '',
            success: ''
        })

    } catch (error) {

        console.log(error)

        res.redirect('/serverError')

    }

}

export async function updateSettings(req, res) {

    try {

        const {
            storeName,
            storeEmail,
            storePhone,
            storeAddress,
            onlinePayment,
            cod,
            deliveryFee,
            minimumOrder,
            deliveryTime,
            defaultMaxOrder,
            storeOpen,
            acceptOrders,
            maintenanceMode
        } = req.body;

        console.log(storeName, storeEmail, storePhone, storeAddress, onlinePayment, cod, deliveryFee, minimumOrder, deliveryTime, defaultMaxOrder, storeOpen, acceptOrders, maintenanceMode)
        // Convert checkbox values to booleans

        const settings = {
            storeName,
            storeEmail,
            storePhone,
            storeAddress,

            onlinePayment: onlinePayment === 'true',
            cod: cod === 'true',

            deliveryFee: Number(deliveryFee),
            minimumOrder: Number(minimumOrder),

            deliveryTime,

            defaultMaxOrder: Number(defaultMaxOrder),

            storeOpen: storeOpen === 'true',
            acceptOrders: acceptOrders === 'true',
            maintenanceMode: maintenanceMode === 'true'
        };


        // Validate

        if (
            typeof storeName !== 'string' ||
            !storeName.trim() ||

            typeof storeEmail !== 'string' ||
            !storeEmail.trim() ||

            !Number.isFinite(settings.deliveryFee) ||
            settings.deliveryFee < 0 ||

            Number(settings.minimumOrder) < 0 ||

            !Number.isInteger(settings.defaultMaxOrder) ||
            settings.defaultMaxOrder < 1 ||

            !['30-45', '45-60', '60-90', '90-120']
                .includes(deliveryTime)
        ) {
            return res.status(400).render('admin/adminSettings', {
                error: 'Invalid settings',
                success: '',
                settings: req.body,
                admin: req.user
            });
        }


        // Update the settings document

        await settingsModel.findOneAndUpdate(
            {},
            settings,
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        console.log(await settingsModel.findOne({}))

        return res.redirect(
            '/admin/settings?success=Settings%20saved%20successfully'
        );

    } catch (err) {

        console.error(err);

        return res.status(500).render('admin/adminSettings', {
            error: 'Unable to save settings',
            success: '',
            settings: req.body,
            admin: req.user
        });

    }

}
