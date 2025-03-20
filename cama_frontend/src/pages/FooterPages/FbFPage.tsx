{/*This file conatins the code responible for controlling the content and cunction of the about page*/}

import React from "react";
import {Grid, Paper, Box, Typography} from "@mui/material";
import CAMA_test_icon from "../../assets/images/CAMA_test_icon.png";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';



import '@mui/material';

const FbFPage: React.FC = () => {
	return (
        <Box>
            {/*Creats a centered title wich the icon on both sides*/}
            <Box display="flex"  justifyContent="center"  alignItems="center">
                <Box display="flex" sx={{justifyContent:"flex-start"}}>
                    <img src={CAMA_test_icon} alt="Description of the image" width="250" height="250" style={{ top: '-50px', position: 'relative' }}/>  
                    <Typography variant="h1" style={{ color: 'black' , textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}> Faktabaserad Fakta</Typography>
                    <img src={CAMA_test_icon} alt="Description of the image" width="250" height="250" style={{ top: '-50px', position: 'relative' }}/>                        
                </Box>
            </Box>
        

        {/*Creats the two blocks for about text and a timeline report, with headline for the timeline*/}

        <Grid container spacing={2} >
            <Grid item xs={8} sx={{ mb: 3}}>
                <Paper sx={{p:3, height:'100%'}} style={{ textAlign: 'left' }}> 
                    <p> • Faktabaserad Fakta/Fact-based Facts (FbF) </p> <br />
                    <p> • Undervisning i skolan ska vara baserad på beprövad erfarenhet och vila på vetenskaplig grund. </p> <br />
                    <p> • Men vad innebär egentligen vetenskaplig grund? Är det samma information som vad vetenskapligt publicerade artiklar säger? 
                        Är det vad inspirationsföreläsaren informerade om på KPT-dagen? Eller kanske skolverkets rekommendationer? H
                        ur ska man som lärare, specialpedagog eller rektor kunna orientera sig i det ständigt växande utbudet av nya forskningsrön? </p> <br />
                    <p> • I dag publiceras det så mycket forskning kring lärande, didaktik och skola att det är närmast omöjligt ens för 
                        en meriterad professor att hålla sig uppdaterad. Det är en avancerad och krävande uppgift att uppdatera och väga
                         nya fynd, som dessutom ofta säger emot varandra. Speciellt när alla studier som publiceras är inte lika relevanta 
                         eller av samma kvalitet.  </p> <br />
                    <p> • I takt med att mängden forskning har ökat har också ett nytt fält vuxit fram: meta-vetenskap. 
                        Meta-forskare har tagit fram metoder för att kritiskt granska och sammanställa forskning. 
                        En av de viktigaste insikterna meta-vetenskapen har bidragit med är att de flesta vetenskapliga fynd som
                         publiceras inte är tillförlitliga. När forskare gör om studierna (sk. ”replikerar”) får de mycket ofta 
                         ett helt annat resultat. Denna meta-vetenskapliga insikt har chockat forskarvärlden,
                          och man talar ofta om den så kallade replikationskrisen. </p> <br />
                    <p> • Det finns flera anledningar till varför forskningsresultat inte kan replikeras, men en viktig 
                        anledning är att forskare har enorma incitament att publicera sin forskning, nå ut med sina idéer,
                         osv. (så som respekt/uppskattning, pengar och karriärsmöjligheter). Detta har gjort att forskare har
                          prioriterat innovativa, spännande och preliminära resultat, och mitt i allt det här är lätt att glömma 
                          bort att det är lika viktigt att forskning granskas och bekräftas innan den når ut.  </p> <br />
                    <p> • Även om det här kan låta som att man borde ge upp hoppet, är det viktigt att poängtera att detta inte innebär
                         att man inte kan lita på forskning. Tvärtom så har vi aldrig tidigare haft så pass god insikt i vad som krävs 
                         för att veta om forskning är tillförlitlig eller inte. Det endas som krävs är att någon faktiskt tar sig tiden 
                         att göra det mindre glamorösa och inte lika spännande arbetet med att kritiskt granska och sammanställa vad forskningen faktiskt visar.  </p> <br />
                    <p> • Detta är utgångspunkten för den meta-forskning vi gör i vår forskargrupp Evidens inom Lärande och Didaktik (ELD).
                         Vi brinner för att forskning som presenteras för lärare, rektorer och andra pedagoger ska vara noggrant granskad
                          och korrekt, och presenterat på ett begripligt och relevant sätt. Vi vill vara ett alternativ till virrvarret av
                           motstridiga budskap kring vad som är bäst för skolan.  </p> <br />
                    <p> • Det är också viktigt att poängtera vad vi inte gör. Vi tar inte fram rekommendationer kring hur lärare ska arbeta i skolan,
                         och vi driver inte ideologiska debatter kring hur skolan bör vara organiserad. Vår utgångspunkt är att detta är en uppgift
                          för skolväsendet och att vår roll endast är att leverera ett tydligt kunskapsunderlag som hjälper lärare,
                           rektorer och andra pedagoger i skolan att ta informerade beslut i sitt dagliga arbete.  </p> <br />

                </Paper>
            </Grid>

            {/*Dropdown text on the right side*/}
            <Grid item xs={4}>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        >
                        <Typography>Min favoritintervention är inte med, betyder det att den är ovetenskaplig?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <Typography>
                        Absolut inte! Det är väldigt viktigt att onämnda teorier/interventioner
                         inte automatiskt är sämre eller mindre viktiga. 
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        >
                        <Typography>Men vad säger ni om ___-teorin? Jag hittar inget om den.</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <Typography>
                        Vi har nog helt enkelt inte kollat upp den än! Detta kan bero på att
                         det är en relativt ny teori/intervention som det inte har gjorts
                          någon meta-forskning på än eller så finns det inga systematiska
                           översikter som passerar vår kvalitetskontroll. <br /> <br />

                        Översikt över de senaste trenderna:  <br /> 
                        Kontaktformulär:  
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        >
                        <Typography>Vad är en systematisk översikt?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <Typography>
                            Information kommer.
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        >
                        <Typography>Vilka är ELD egentligen?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <Typography>
                        Information kommer.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Grid>
        </Grid>
        

        {/* </Grid>  */}

        

        </Box>
		);
	};
	
	export default FbFPage;