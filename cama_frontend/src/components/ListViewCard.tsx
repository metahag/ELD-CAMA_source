import React from "react";
import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";
import { DataEntry } from "../api/types";
import defaultImage from "../assets/images/bild2.png";
import { useNavigate } from "react-router-dom";

interface ListViewCardProps {
  data: DataEntry;
}

const ListViewCard: React.FC<ListViewCardProps> = ({ data }) => {
  let navigate = useNavigate();

  const handleCardClick = () => {
    const titleSlug = encodeURIComponent(data.title);
    navigate(`/datasets/${titleSlug}`);
  };

  return (
    <Card
      sx={{
        display: "flex",
        width: "100%",
        mb: 2,
        transition: "transform .3s",
        "&:hover": { transform: "scale(1.05)" },
        boxShadow:
          "0 2px 4px -2px rgba(0,0,0,.24), 0 4px 24px -2px rgba(0, 0, 0, .2)",
      }}
      onClick={handleCardClick}
    >
      <CardMedia
        component="img"
        sx={{ width: 151, height: "auto" }}
        image={data.image || defaultImage}
        alt={data.title}
      />
      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <CardContent sx={{ flex: "1 0 auto" }}>
          <Typography variant="h6">{data.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {data.authors}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
};

export default ListViewCard;
