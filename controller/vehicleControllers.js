import {PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const getVehicle  = async (req, res) => {
    try {
        const response  = await prisma.vehicle.findMany()
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}
export const getVehiclebyId  = async (req, res) => {
    try {
        const response  = await prisma.vehicle.findUnique({
            where: {
                id: req.params.id
            }
        })
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}
export const createVehicles = async (req, res) => {
    const { model, year, type} = req.body;

    try {
        const newVehicle = await prisma.vehicle.create({
            data: {
                model,
                year: parseInt(year, 10),
                type,
               
            }
        });

        res.status(201).json({ msg: "Vehicle created successfully", data: newVehicle });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Failed to create vehicle." });
    }
};

export const updateVehicle = async (req, res) => {
    const { id } = req.params;
    const { model, year, type } = req.body; 

    try {
        const existingVehicle = await prisma.vehicle.findUnique({
            where: { id: id },
        });

        if (!existingVehicle) {
            return res.status(404).json({ msg: "Vehicle not found." });
        }
        const updatedVehicle = await prisma.vehicle.update({
            where: { id: id },
            data: {
                model,
                year: parseInt(year, 10),
                type,
            },
        });

        res.status(200).json({ msg: "Vehicle updated successfully", data: updatedVehicle });
    } catch (error) {
        console.error("Error updating vehicle:", error);
        res.status(500).json({ msg: "Failed to update vehicle." });
    }
};
export const deleteVehicle  = async (req, res) => {
    const vehicle = await prisma.vehicle.findUnique({
        where:{
            id: req.params.id
        }
    });
    if (!vehicle) res.status(400).json({msg: "Data tidak ditemukan"});
    try {
        const response  = await prisma.vehicle.delete({
            where:
            {
                id: req.params.id
            }
        })
        res.status(200).json({msg: "Data dihapus"})
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}