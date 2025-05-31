import Usuario from "../models/Usuario.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


export const register = async (req, res)=>{
    try{
        const {nombre, email, password, rol} = req.body;
        const existeUsuario = await Usuario.findOne({email});
        if (existeUsuario){
            return res.status(400).json({
                error: 'El correo que estas ingresando ya esta asociado a un usuario, elige otro.'
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const nuevoUsuario = new Usuario({
            nombre, 
            email,
            password: hashedPassword,
            rol 
        })

        await nuevoUsuario.save();

        res.status(201).json({
            _id: nuevoUsuario._id,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol
        })

    }catch(error){
        res.status(400).json({
            message: 'error al registrar el usuario', error 
        });
    }
}

export const logIn = async (req, res) =>{
    try{
        const {email, password} = req.body;
        if (!email || !password){
            return res.status(400).json({
                error: 'No se enviaron todas las credenciales.'
            })
        }
        const usuario = await Usuario.findOne({email});
        if (!usuario){
            return res.status(400).json({
                error: 'No existe un usuario con tus credenciales, registrate primero.'
            })
        }
        const isMatch = await bcrypt.compare(password, usuario.password)
        if (!isMatch){
            return res.status(400).json({
                error: 'La contraseña no coincide, intenta de nuevo.'
            })
        }

        const token = jwt.sign(
        { id: usuario._id, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(200).json({
            message: 'Has iniciado sesión satisfactoriamente.',
            token,
            id: usuario._id
        })

        

    }catch(error){
        return res.status(400).json({
            message: 'Error al iniciar sesión', error
        })
    }
}

export const getAllUsers = async (req, res) =>{
    try{
        if (req.user.rol !== 'ADMIN'){
            return res.status(400).json({
                message: 'Acceso denegado! debes ser administrador.'
            })
        }
        const usuarios = await Usuario.find().select('-password');
        res.status(200).json(usuarios);
    }catch(error){
        return res.status(500).json({
            message: 'Error al obtener todos los usuarios', error
        })
    }
}

export const getUserById = async (req,res) =>{
    try{
            const id = req.params.id;
    if (id !== req.user.id && req.user.rol !== 'ADMIN'){
        return res.status(400).json({
            message: 'No tienes acceso a la informacion relacionada con este usuario.'
        })
    }
    const usuario = await Usuario.findById(id).select('-password');
    if (!usuario){
        res.status(404).json({
            message: 'Usuario no encontrado.'
        })
    }
    res.json(usuario)
    }catch (error) {
    console.error('Error en getUserById:', error); // Agregado para debug
    res.status(500).json({
      message: 'Error al obtener el usuario solicitado',
      error: error.message || error
    });
  }
}

export const updateUser = async (req,res) =>{
    try{
        const id = req.params.id;
        if (id !== req.user.id){
            return res.status(400).json({
                message: 'No puedes modificar la información de otro usuario'
            });
        }
        const {email, nombre} = req.body;
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            id,
            {nombre, email},
            {new: true}
        ).select('-password')
        res.json(usuarioActualizado)

    }catch(error){
        res.status(500).json({
            message: 'Error al actualizar el usuario solicitado.', error: error.message
        })
    }
}

export const deleteUser = async (req,res) =>{
    try{
        if(req.user.rol !== 'ADMIN'){
            return res.status(400).json({
                message: 'No tienes permisos para eliminar usuarios'
            });
        }
        const id = req.params.id;
        await Usuario.findByIdAndDelete(id);
        res.json({message: 'Usuario eliminado correctamente'})


    }catch(error){
        res.status(500).json({ error: 'Error al eliminar el usuario' , message: error.message});
    }
}
