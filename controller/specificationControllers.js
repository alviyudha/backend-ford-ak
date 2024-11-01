import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const getSpecification = async (req,res) => {
    try {
        const response = await prisma.specification.findMany()
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}
export const getSpecificationByID = async (req,res) => {
    try {
        const response = await prisma.specification.findUnique({
            where: {
                id: Number(req.params.id)
            }
        })
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}
export const createSpecification = async (req,res) => {
    const { title, text, catSpec, trimId } = req.body;

    try {
        const newSpecification = await prisma.specification.create({
            data: {
                title,
                text,
                catSpec,
                trim: {
                    connect: { id: parseInt(trimId, 10) } 
                }
            }
        });

        res.status(201).json({ msg: "Specification created successfully", data: newSpecification });
    } catch (error) {
        console.error("Error creating Specification:", error);
        res.status(500).json({ msg: "Failed to create Specification." });
    }
}
export const updateSpecification = async (req,res) => {
    const { id } = req.params;
    const { title, text, catSpec, trimId } = req.body;

    try {
        const existingSpecification = await prisma.specification.findUnique({
            where: { id: parseInt(id, 10) }
        });

        if (!existingSpecification) {
            return res.status(404).json({ msg: "Specification not found." });
        }

        const updatedSpecification = await prisma.specification.update({
            where: { id: parseInt(id, 10) },
            data: {
                title,
                text,
                catSpec,
                trim: {
                    connect: { id: parseInt(trimId, 10) }
                }
            }
        });

        res.status(200).json({ msg: "Specification updated successfully", data: updatedSpecification });
    } catch (error) {
        console.error("Error updating Specification:", error);
        res.status(500).json({ msg: "Failed to update Specification." });
    }
}
export const deleteSpecification = async (req,res) => {
    const spec = await prisma.specification.findUnique({
        where: {
            id: Number(req.params.id)
        }
    })
    if (!spec) res.status(404).json({msg: "Data tidak ditemukan"})
    try {
        const response = await prisma.specification.delete({
            where: {
                id: Number(req.params.id)
            }
        })        
        res.status(200).json({msg: "Data berhasil dihapus"})
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
}