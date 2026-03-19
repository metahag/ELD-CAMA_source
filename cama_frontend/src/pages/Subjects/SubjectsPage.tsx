import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Button, CircularProgress } from "@mui/material";
import { fetchStudiesByCategory } from "../../api/dataAPI";
import StudyCard from "../Database/StudyCard";
import { Study } from "../../api/newTypes";

const categories = ["Math", "STEM", "Language"];

const SubjectsPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>("Math");
    const [studies, setStudies] = useState<Study[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchStudies = async () => {
            if (selectedCategory) {
                setLoading(true);
                const studies = await fetchStudiesByCategory(selectedCategory);
                setStudies(studies);
                setLoading(false);
            }
        };
        fetchStudies();
    }, [selectedCategory]);

    return (
        <Box sx={{ minHeight: '100vh', padding: 4 }}>
            <Typography variant="h4" gutterBottom>
                Subjects
            </Typography>
            <Typography variant="body1" gutterBottom>
                Click on a subject to view the studies. Make sure to be connected to the VPN to access all data.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 4 }}>
                {categories.map((category) => (
                    <Button
                        key={category}
                        variant={selectedCategory === category ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </Button>
                ))}
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && selectedCategory && studies && (
                <Box>
                    <Typography variant="h5" gutterBottom>
                        {selectedCategory} Studies
                    </Typography>
                    <Grid container spacing={2}>
                        {studies.map((study) => (
                            <Grid item xs={12} sm={6} md={4} key={study.study_id}>
                                <StudyCard studyData={study} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {!loading && selectedCategory && !studies && (
                <Typography variant="body1">
                    No studies found for this category.
                </Typography>
            )}
        </Box>
    );
};

export default SubjectsPage;