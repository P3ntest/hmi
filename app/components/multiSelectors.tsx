import { Autocomplete, TextField } from "@mui/material";
import { Allergy, Ingredient } from "@prisma/client";
import { useState } from "react";

export function AllergySelector({ allergies, defaultSelected, name }: { allergies: Allergy[], defaultSelected: Allergy[], name: string }) {
    const [selected, setSelected] = useState<Allergy[]>(defaultSelected);

    return <>
        <Autocomplete
            multiple={true}
            id="allergies"
            options={allergies}
            getOptionLabel={(option) => option.name}
            defaultValue={defaultSelected}
            onChange={(_, value) => setSelected(value as Allergy[])}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="standard"
                    label="Allergies"
                    placeholder="Allergy"
                />
            )}
        />
        < input type="hidden" value={JSON.stringify(selected)} name={name} />
    </>
}

export function IngredientSelector({ ingredients, defaultSelected, name }: { ingredients: Ingredient[], defaultSelected: Ingredient[], name: string }) {
    const [selected, setSelected] = useState<Ingredient[]>(defaultSelected);

    return <>
        <Autocomplete
            multiple={true}
            id="ingredients"
            options={ingredients}
            getOptionLabel={(option) => option.name}
            defaultValue={defaultSelected}
            onChange={(_, value) => setSelected(value as Ingredient[])}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="standard"
                    label="Ingredients"
                    placeholder="Ingredient"
                />
            )}
        />
        < input type="hidden" value={JSON.stringify(selected)} name={name} />
    </>
}