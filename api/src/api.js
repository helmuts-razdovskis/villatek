// require('dotenv').config({ path: '.env.local' });

const express = require('express');
const cors = require('cors');
const Sequelize = require('sequelize');
const finale = require('finale-rest');
const Jimp = require('jimp');
var logger = require('morgan');

var api = express();

api.use(logger('dev'));
api.use(express.json());
api.use(express.urlencoded({ extended: false }));
// api.use(express.static(path.join(__dirname, 'public')));
api.use(cors());



// api.use(async (req, res, next) => {
//     try {
//         if (!req.headers.authorization) throw new Error('Authorization header is required');
//
//         const accessToken = req.headers.authorization.trim().split(' ')[1];
//         await oktaJwtVerifier.verifyAccessToken(accessToken, 'api://default');
//         next();
//     } catch (error) {
//         next(error.message);
//     }
// });

const database = new Sequelize({
    dialect: 'sqlite',
    storage: './data/db.sqlite',
});

const FieldSizes = {
    URL: 1024,
    TITLE: 256,
    CODE: 64,
}

const MCategory = database.define('mcategory', {
    code: Sequelize.STRING(FieldSizes.CODE),
    title: Sequelize.STRING(FieldSizes.TITLE),
    imageUrl: Sequelize.STRING(FieldSizes.URL),
});
// // MBLOCKS table
const MBlock = database.define('mblock', {
    code: Sequelize.STRING(FieldSizes.CODE),
    title: Sequelize.STRING(FieldSizes.TITLE),
    imageUrl: Sequelize.STRING(FieldSizes.URL),
    description: Sequelize.TEXT,
});

// MVARIANTS table
const MVariant = database.define('mvariant', {
    code: Sequelize.STRING(FieldSizes.CODE),
    subtitle: Sequelize.STRING(FieldSizes.TITLE),
    m2: Sequelize.DECIMAL(10, 4),
    price: Sequelize.DECIMAL(10, 2),
    imageUrl: Sequelize.STRING(FieldSizes.URL),
    description: Sequelize.TEXT,
});

// MCONNECTIONS table
const MConnection = database.define('mconnection', {
    snap: Sequelize.STRING(1), // T|L|B|R
    transform: Sequelize.STRING, // [-][deg][-]
    x: Sequelize.INTEGER,
    y: Sequelize.INTEGER,
    mvariantToId: {
        type: Sequelize.INTEGER,
        references: {
            model: MVariant,
            key: 'id'
        }
    }
});

// RELATIONSHIPS
// MCategory

// MBlock
MBlock.belongsTo(MCategory, { foreignKey: 'mcategoryId', as: 'mcategory', constraints: false });
MBlock.hasMany(MVariant, { as: 'mvariants' })
// MVariant
MVariant.belongsTo(MBlock, { foreignKey: 'mblockId', as: 'mblock', constraints: false })
MVariant.hasMany(MConnection, { as: 'mconnections' });
// MConnection
MConnection.belongsTo(MVariant, { foreignKey: 'mvariantId', as: 'mvariant', constraints: false });
MConnection.hasOne(MVariant, { sourceKey: 'mvariantToId', foreignKey: 'id', as: 'mvariantTo', constraints: false });

finale.initialize({ app: api, sequelize: database });

finale.resource({
    model: MCategory,
});
finale.resource({
    model: MBlock,
});
finale.resource({
    model: MVariant,
});
finale.resource({
    model: MConnection,
});


function getExtension(filename) {
    return filename.split('.').pop();
}

api.get('/images/*', (req, res) => {
    Jimp.read(__dirname + "/public" + req.path)
        .then((image) => {
            if (req.query.r) {
                // let r = req.query.r;
                // if (r.lastIndexOf("-") > -1) {
                //     image.flip(true);
                //     r.slice(0, -1);
                // } else if (req.query.r.lastIndexOf("+") > -1) {
                //     image.flip(false);
                //     r.slice(0, -1);
                // }
                const rotation = parseInt(req.query.r);
                if (!isNaN(rotation))
                    image.rotate(rotation);
            }
            const ext = getExtension(req.path);
            res.type(ext);
            const ct = res._headers['content-type'];
            console.log("===>>>> " + ext + " : " + ct);
            image.getBufferAsync(ct)
                .then(buffer => res.send(buffer));
        });
});

const port = process.env.SERVER_PORT || 3001;

database.sync({ force: false }).then(() => {
    api.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
});

module.exports = api;
