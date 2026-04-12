import AsyncCreatableSelect from 'react-select/async-creatable';
import debounce from 'lodash/debounce';
import { useMemo, useEffect } from 'react';

type Option = {
    value: number | string | null;
    label: string;
};

type Props = {
    isMulti?: boolean;
    value: Option[] | Option | null;
    onChange: (value: any) => void;
    loadOptions: (inputValue: string) => Promise<Option[]>;
    onCreate: (inputValue: string) => Promise<Option>;
    placeholder?: string;
    isDisabled?: boolean;
};

const AsyncCreatableSelectField = ({
    isMulti = false,
    value,
    onChange,
    loadOptions,
    onCreate,
    placeholder,
    isDisabled = false, // default false
}: Props) => {

    // 🔥 Debounce loadOptions
    const debouncedLoadOptions = useMemo(() => {
        return debounce(
            (
                inputValue: string,
                callback: (options: Option[]) => void
            ) => {
                loadOptions(inputValue)
                    .then((options) => {
                        callback(options);
                    })
                    .catch((err) => {
                        console.error('Load options error:', err);
                        callback([]);
                    });
            },
            500 // delay 500ms
        );
    }, [loadOptions]);

    // 🧹 Cleanup debounce khi unmount
    useEffect(() => {
        return () => {
            debouncedLoadOptions.cancel();
        };
    }, [debouncedLoadOptions]);

    return (
        <AsyncCreatableSelect
            isMulti={isMulti}
            isDisabled={isDisabled}
            cacheOptions
            defaultOptions
            loadOptions={debouncedLoadOptions} // ✅ dùng debounce ở đây
            value={value}
            onChange={(val) => {
                if (isDisabled) return;
                onChange(val);
            }}
            onCreateOption={async (inputValue) => {
                if (isDisabled) return;
                try {
                    const newOption = await onCreate(inputValue);

                    if (isMulti) {
                        onChange([...(value as Option[] || []), newOption]);
                    } else {
                        onChange(newOption);
                    }
                } catch (err) {
                    console.error('Create option error:', err);
                }
            }}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({
                    ...base,
                    backgroundColor: isDisabled ? '#f1f5f9' : '#ffffff',
                    cursor: isDisabled ? 'not-allowed' : 'default',
                    opacity: isDisabled ? 0.8 : 1,
                }),
            }}
            placeholder={placeholder}
        />
    );
};

export default AsyncCreatableSelectField;