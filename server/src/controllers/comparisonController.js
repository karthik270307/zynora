const comparisonService =
    require("../services/comparisonService");


exports.compareCreatives = async (req, res) => {

    try {

        console.log(
            "Received comparison request"
        );


        console.log(
            "Creative A:",
            req.body?.creativeA
        );


        console.log(
            "Creative B:",
            req.body?.creativeB
        );


        const result =
            await comparisonService.compareCreatives(
                req.body
            );


        console.log(
            "Comparison result generated successfully"
        );


        res.status(200).json({

            success: true,

            data: result

        });


    } catch (error) {

        console.error(
            "Comparison error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Creative comparison failed",

            error:
                error?.message ||
                "Unknown comparison error"

        });

    }

};