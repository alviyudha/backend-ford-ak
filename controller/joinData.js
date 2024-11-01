import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getDataModel = async (req, res) => {
  try {
      const vehicles = await prisma.vehicle.findMany({
          include: {
              trims: true,
          },
      });

      // Prepare the data for each model
      const responseData = vehicles.map(vehicle => ({
          model: vehicle.model,
          data: vehicle.trims.map(trim => ({
              name: trim.trim,
              link: trim.linkPage,
              imgView: trim.urlImgView,
          })),
      }));

      // Create an "All" model entry that combines all trims from all vehicles
      const allTrims = vehicles.flatMap(vehicle => 
          vehicle.trims.map(trim => ({
              name: trim.trim,
              link: trim.linkPage,
              imgView: trim.urlImgView,
          }))
      );

      // Add the "All" model entry
      responseData.unshift({
          model: "All",
          data: allTrims,
      });

      res.status(200).json(responseData);
  } catch (error) {
      console.error("Error fetching data model:", error);
      res.status(500).json({ msg: "Failed to fetch data model." });
  }
};

export const getDataDetailByLink = async (req, res) => {
  const { linkpage } = req.params;

  try {
    // Use findFirst instead of findUnique
    const trim = await prisma.trim.findFirst({
      where: {
        linkPage: linkpage, // Find by linkPage
      },
      include: {
        vehicle: true, // To get the vehicle details
        colors: true, // To fetch associated colors
        miniSpecs: true, // To fetch associated mini specs
        specifications: true, // To fetch associated specifications
      },
    });

    if (!trim) {
      return res.status(404).json({
        status: 'error',
        message: 'Trim not found.',
      });
    }

    // Fetch all trims for the model to get all link pages
    const allTrims = await prisma.trim.findMany({
      where: {
        vehicleId: trim.vehicleId, // Get all trims for the same vehicle
      },
      select: {
        linkPage: true, // Only fetch linkPage
      },
    });

    // Group specifications by catSpec
    const groupedSpecifications = trim.specifications.reduce((acc, spec) => {
      if (!acc[spec.catSpec]) {
        acc[spec.catSpec] = [];
      }
      acc[spec.catSpec].push({
        title: spec.title,
        text: spec.text,
        trimId: spec.trimId,
      });
      return acc;
    }, {});

    // Group miniSpecs by catMiniSpec
    const groupedMiniSpecs = trim.miniSpecs.reduce((acc, miniSpec) => {
      if (!acc[miniSpec.catMiniSpec]) {
        acc[miniSpec.catMiniSpec] = [];
      }
      acc[miniSpec.catMiniSpec].push({
        id: miniSpec.id,
        title: miniSpec.title,
        text: miniSpec.text,
        urlImgMiniSpec: miniSpec.urlImgMiniSpec,
        trimId: miniSpec.trimId,
      });
      return acc;
    }, {});

    // Build the response data
    const responseData = {
      status: 'success',
      message: 'Data fetched successfully',
      data: {
        linkPage: trim.linkPage,
        backgroundImg: trim.backgroundImg,
        urlBackgroundImg: trim.urlBackgroundImg,
        urlYoutube: trim.urlYoutube,
        allLinkPage: allTrims.map(t => t.linkPage), // Collecting all linkPages
        colorsData: trim.colors.map(color => ({
          title: color.title,
          text: color.text,
          descColor: color.descColor,
          colorsImage: color.colorsImage,
          urlcolorsImage: color.urlcolorsImage,
          backgroundColor: color.backgroundColor,
          trimId: color.trimId,
        })),
        minispec: groupedMiniSpecs, // Grouped by catMiniSpec
        specification: groupedSpecifications, // Grouped by catSpec
      }
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching data detail by link:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch data detail.',
    });
  }
};
export const getTrimGroupVehicle = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        trims: true, 
      },
    });

    const groupedTrims = vehicles.reduce((acc, vehicle) => {
      if (!acc[vehicle.model]) {
        acc[vehicle.model] = [];
      }
      
      vehicle.trims.forEach(trim => {
        const itemSpec = [
          trim.itemSpec1,
          trim.itemSpec2,
          trim.itemSpec3,
        ].filter(spec => spec && spec.trim() !== ""); 

        acc[vehicle.model].push({
          ...trim,
          itemSpec, 
        });
      });

      return acc;
    }, {});

    // Kirim respon
    res.status(200).json(groupedTrims);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getColorTrim = async (req, res) => {
  try {
    const colors = await prisma.color.findMany({
      include: {
        trim: {
          select: {
            linkPage: true
          }
        }
      }
    });
    res.json(colors);
  } catch (error) {
    console.error("Error fetching colors with trim data:", error);
    res.status(500).json({ error: "Failed to fetch colors with trim data." });
  }
};
export const getMiniSpecTrim = async (req, res) => {
  try {
    const colors = await prisma.miniSpec.findMany({
      include: {
        trim: {
          select: {
            linkPage: true
          }
        }
      }
    });
    res.json(colors);
  } catch (error) {
    console.error("Error fetching colors with Mini Spec data:", error);
    res.status(500).json({ error: "Failed to fetch colors with Mini Spec data." });
  }
};
export const getSpecTrim = async (req, res) => {
  try {
    const colors = await prisma.specification.findMany({
      include: {
        trim: {
          select: {
            linkPage: true
          }
        }
      }
    });
    res.json(colors);
  } catch (error) {
    console.error("Error fetching colors with Mini Spec data:", error);
    res.status(500).json({ error: "Failed to fetch colors with Mini Spec data." });
  }
};

export const getDropdownData = async (req, res) => {
  try {
    // Fetch trims and dealers
    const datatrim = await prisma.trim.findMany({
      select: {
        linkPage: true,
      },
    });

    const datadealer = await prisma.dealer.findMany({
      select: {
        name: true,
        whatsapp: true,
      },
    });

    // Return the response
    return res.status(200).json({
      datatrim,
      datadealer,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



