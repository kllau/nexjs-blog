import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';

export function CourseCard (props) {
    return <CardActionArea>
        <CardContent>
            <Typography variant="h5" component="div">
                {props.course.name}
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                {props.course.source_language} - {props.course.target_language}
            </Typography>
            <Typography variant="body2">
                {props.course.description}
            </Typography>
        </CardContent>
    </CardActionArea>
};