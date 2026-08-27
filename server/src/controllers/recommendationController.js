const recommendationService =
    require("../services/recommendationService");


// ==========================================
// GENERATE RECOMMENDATIONS
// ==========================================

exports.generateRecommendations = async (req, res) => {

    try {

        console.log(
            "Generating recommendations..."
        );

        console.log(
            "Recommendation input:",
            req.body
        );


        // ==========================================
        // CALL SERVICE
        // ==========================================

        const result =
            await recommendationService.generateRecommendations(
                req.body
            );


        console.log(
            "Recommendation service result:",
            result
        );


        // ==========================================
        // RESULT VALIDATION
        // ==========================================

        if (!result) {

            throw new Error(
                "Recommendation service returned an empty result."
            );

        }


        // ==========================================
        // HANDLE OBJECT RESULT
        // ==========================================

        let recommendations;


        if (
            typeof result === "object"
        ) {

            recommendations = result;

        }


        // ==========================================
        // HANDLE STRING RESULT
        // ==========================================

        else if (
            typeof result === "string"
        ) {

            let cleanedResult =
                result
                    .replace(
                        /```json/gi,
                        ""
                    )
                    .replace(
                        /```/g,
                        ""
                    )
                    .trim();


            // --------------------------------------
            // FIND JSON OBJECT
            // --------------------------------------

            const start =
                cleanedResult.indexOf("{");

            const end =
                cleanedResult.lastIndexOf("}");


            if (
                start === -1 ||
                end === -1
            ) {

                throw new Error(
                    "Gemini did not return valid JSON."
                );

            }


            cleanedResult =
                cleanedResult.substring(
                    start,
                    end + 1
                );


            recommendations =
                JSON.parse(
                    cleanedResult
                );

        }


        // ==========================================
        // INVALID RESPONSE TYPE
        // ==========================================

        else {

            throw new Error(
                "Invalid recommendation response type."
            );

        }


        // ==========================================
        // VALIDATE RECOMMENDATIONS
        // ==========================================

        if (
            !recommendations ||
            typeof recommendations !== "object"
        ) {

            throw new Error(
                "Invalid recommendation result."
            );

        }


        if (
            !Array.isArray(
                recommendations.recommendations
            )
        ) {

            throw new Error(
                "Recommendation result does not contain a valid recommendations array."
            );

        }


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        res.status(200).json({

            success: true,

            data: recommendations

        });


    } catch (error) {

        console.error(
            "Recommendation error:",
            error
        );


        // ==========================================
        // ERROR RESPONSE
        // ==========================================

        res.status(500).json({

            success: false,

            message:
                "Recommendation generation failed",

            error:
                error.message

        });

    }

};