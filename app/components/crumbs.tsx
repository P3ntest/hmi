import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link as MuiLink } from '@mui/material';
import { Link } from '@remix-run/react';

export function BasicBreadcrumbs({ items }: { items: (string | string[])[] }) {
    items = ["PSV", ...items];

    return (
        <div style={{ margin: "20px 0" }}>
            <Breadcrumbs aria-label="breadcrumb">
                {items.map((item, index) => {
                    const color = index === items.length - 1 ? 'text.primary' : 'inherit';
                    if (Array.isArray(item)) {
                        return <Link to={item[1]} style={{ color: "inherit" }}>
                            <MuiLink underline="hover" color={color}>
                                {item[0]}
                            </MuiLink>
                        </Link>;
                    } else {
                        return <Typography color={color}>{item}</Typography>
                    }
                })}
            </Breadcrumbs>
        </div>
    );
}
