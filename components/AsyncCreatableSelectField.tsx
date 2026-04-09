import AsyncCreatableSelect from 'react-select/async-creatable';

type Option = {
    value: number | null;
    label: string;
};

type Props = {
    isMulti?: boolean;
    value: Option[] | Option | null;
    onChange: (value: any) => void;
    loadOptions: (inputValue: string) => Promise<Option[]>;
    onCreate: (inputValue: string) => Promise<Option>;
    placeholder?: string;
};

const AsyncCreatableSelectField = ({
    isMulti = false,
    value,
    onChange,
    loadOptions,
    onCreate,
    placeholder,
}: Props) => {
    return (
        <AsyncCreatableSelect
            isMulti={isMulti}
            cacheOptions
            defaultOptions
            loadOptions={loadOptions}
            value={value}
            onChange={onChange}
            onCreateOption={async (inputValue) => {
                const newOption = await onCreate(inputValue);
                if (isMulti) {
                    onChange([...(value as Option[] || []), newOption]);
                } else {
                    onChange(newOption);
                }
            }}
            placeholder={placeholder}
        />
    );
};

export default AsyncCreatableSelectField;