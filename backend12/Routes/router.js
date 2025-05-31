import express from 'express';
import  {register, logIn, getAllUsers, getUserById, updateUser, deleteUser}  from '../Controllers/UserController.js';
import { createCity, getAllCities, getCityById, deleteCity, updateCity } from '../Controllers/CityController.js';
import { createCountry, getAllCountries, getCountryById, deleteCountry, updateCountry } from '../Controllers/PaisController.js';
import { verificarToken, esAdmin } from '../Middlewares/AuthMiddleware.js';
import { createFamoso, getFamosos, getFamosoById, updateFamoso, deleteFamoso} from '../Controllers/FamosoController.js';
import { createSite, getAllSites, getSiteById, updateSite, deleteSite} from '../Controllers/SiteController1.js';
import { createDish, getAllDishes, getDishById, deleteDish, updateDish } from '../Controllers/dishController.js';
import { createVisita, getAllVisitas, getVisitasByUser } from '../Controllers/VisitaController.js';
import { createEncuentro, getAllEncuentros, getEncuentrosByUser } from '../Controllers/EncuentroController.js';
import { createTag, getTagsByUser, getAllTags } from '../Controllers/TagController.js';
import { topSitiosPorPais, visitasPorUsuario, platosMasCarosPorPais, tagsPorSitio } from '../Controllers/consultasControllers.js';

const router = express.Router();

router.get('/',(req,res) =>{
    res.send(
        '<h1>Ay mi madreee</h1>'
    )
});

//Usuarios
router.post('/api/register', register);
router.post('/api/login',logIn);

//Rutas solo para el usuario con sesion activa.
router.get('/api/getUser/:id', verificarToken, getUserById);
router.put('/api/updateUser/:id', verificarToken, updateUser);
router.get('/api/getCity/:id', getCityById);
router.put('/api/updateCity/:id', verificarToken, updateCity);
router.get('/api/getCountry/:id', getCountryById);
router.put('/api/updateCountry/:id', verificarToken, updateCountry);
router.get('/api/getFamoso/:id', verificarToken, getFamosoById);
router.put('/api/updateFamoso/:id', verificarToken, updateFamoso);
router.get('/api/getSite/:id', verificarToken, getSiteById);
router.put('/api/updateSite/:id', verificarToken, updateSite);
router.get('/api/getDish/:id', verificarToken, getDishById);
router.put('/api/updateDish/:id', verificarToken, updateDish);
router.get('/api/myVisitas', verificarToken, getVisitasByUser);
router.get('/api/myEncuentros', verificarToken, getEncuentrosByUser);
router.post('/api/createTag', verificarToken, createTag);
router.get('/api/myTags', verificarToken, getTagsByUser);

//Rutas solo para admin.
router.get('/api/getAllUsers', verificarToken, esAdmin, getAllUsers);
router.delete('/api/deleteUser/:id',verificarToken, deleteUser);
router.post('/api/createCity', verificarToken, createCity );
router.post('/api/createCountry', verificarToken, createCountry );
router.post('/api/createCity', verificarToken, createCity);
router.get('/api/getCities', getAllCities);
router.delete('/api/deleteCity/:id', verificarToken, deleteCity);
router.post('/api/createCountry', verificarToken, createCountry);
router.get('/api/getCountries', getAllCountries);
router.delete('/api/deleteCountry/:id', verificarToken, deleteCountry);
router.post('/api/createFamoso', verificarToken, createFamoso);
router.get('/api/getFamosos', verificarToken, getFamosos);
router.delete('/api/deleteFamoso/:id', verificarToken, deleteFamoso);
router.post('/api/createSite', verificarToken, createSite);
router.get('/api/getSites', verificarToken, getAllSites);
router.delete('/api/deleteSite/:id', verificarToken, deleteSite);
router.post('/api/createDish', verificarToken, createDish);
router.get('/api/getDishes', verificarToken, getAllDishes);
router.delete('/api/deleteDish/:id', verificarToken, deleteDish);
router.post('/api/createVisita', verificarToken, createVisita);
router.post('/api/createEncuentro', verificarToken, createEncuentro);
router.get('/api/allVisitas', verificarToken, getAllVisitas);
router.get('/api/allEncuentros', verificarToken, getAllEncuentros);
router.get('/api/allTags', verificarToken, getAllTags);


//CONSULTAS ESPECIALES 

router.get('/api/top10/:nombrePais', verificarToken, topSitiosPorPais);
router.get('/api/visitasPorUsuario', verificarToken, visitasPorUsuario);
router.get('/api/platosMasCaros', verificarToken, platosMasCarosPorPais);
router.get('/api/tagsPorSitio', verificarToken, tagsPorSitio);



export default router; 


