{/*This file conatins the code responible for controlling the content and cunction of the about page*/}

import React from "react";
import {Grid, Box} from "@mui/material";



import '@mui/material';


const AboutPage: React.FC = () => {

	return (
        <Box>
            {/*Creats a centered title wich the icon on both sides*/} 
            <Box display="flex"  justifyContent="center"  alignItems="center">
                <Box display="flex" sx={{justifyContent:"flex-start"}}>                      
                </Box>
            </Box>
        

        {/*Creats a block for about text*/}
        
        <Grid container rowSpacing={8}>
                    <Grid item xs={12}>
                    </Grid>
                </Grid>

        </Box>
		);
	};
	
	export default AboutPage;