import * as React from 'react';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

export function BasicBreadcrumbs({ items }: { items: (string | string[])[] }) {
    items = ["PSV", ...items];

    return (
        <div style={{ margin: "20px 0" }}>
            <Breadcrumbs aria-label="breadcrumb">
                {items.map((item, index) => {
                    const color = index === items.length - 1 ? 'text.primary' : 'inherit';
                    if (Array.isArray(item)) {
                        return <Link underline="hover" color={color} href={item[1]}>
                            {item[0]}
                        </Link>;
                    } else {
                        return <Typography color={color}>{item}</Typography>
                    }
                })}
            </Breadcrumbs>
        </div>
    );
}
