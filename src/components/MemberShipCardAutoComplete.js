import { TextField } from 'ui/text-field'
import { useFetchGetMembershipsForAutocomplete } from "hooks/useFetchGetMembership";
import useToggle from "hooks/useToggle";
import idx from "idx";
import React, { useState, useEffect } from "react";
import { Autocomplete } from 'ui/combobox'

const MemberShipCardAutoComplete = (
  {
    className = '',
    onChange = () => {},
    label = "",
    value,
    autoFocus,
    onFocus,
    onKeyDown,
    tabIndex,
    inputProps = {},
    setMembershipAlready,
    getData
  },
  ref
) => {
  const product = useToggle();
  const [productKeyword, setProductKeyword] = useState("");
  const products = useFetchGetMembershipsForAutocomplete({
    // keyword: productKeyword,
    isAvailableForSale: true,
  });

  useEffect(() => {
    if (setMembershipAlready !== undefined && !products.loading) {
      setMembershipAlready(!products.loading);
    }
  }, [products.loading, setMembershipAlready]);
  const options = idx(products, (_) => _.data.memberships.data) || [];

  useEffect(() => {
    if (options.length > 0) getData && getData(options)
  }, [options])

  const selectedValue =
    idx(products, (_) =>
      _.data.memberships.data.find((d) => d.uuid === value)
    ) || null;
  useEffect(() => {
    if (
      selectedValue?.no === productKeyword ||
      selectedValue?.name.includes(productKeyword)
    ) {
      setProductKeyword(selectedValue.name);
    }
  }, [selectedValue]);
  useEffect(() => {
    if (selectedValue === null && value === "") {
      setProductKeyword("");
    }
  }, [value, selectedValue]);

  return (
    <Autocomplete
      freeSolo
      open={product.open}
      // inputValue={productKeyword}
      onOpen={product.toggle}
      onClose={product.toggle}
      className={className}
      value={selectedValue}
      options={options}
      autoHighlight
      clearOnBlur={true}
      getOptionLabel={(option) => {
        if (option === productKeyword) {
          return productKeyword;
        } else {
          return `${option.name}-${option.effecitveDay}天`;
        }
      }}
      loading={products.loading}
      onChange={(_event, value) =>
        onChange(idx(value, (_) => value || { uuid: "" }))
      }
      renderOption={(props, option) => (
        <span
          {...props}
          data-testid={`${inputProps["data-testid"]}-${option.name}`}
        >{`${option.name} - ${option.no}`}</span>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          fullWidth
          onChange={(event) =>
            setProductKeyword(idx(event, (_) => _.target.value))
          }
          variant="outlined"
          inputRef={ref}
          autoFocus={autoFocus}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          tabIndex={tabIndex}
          InputProps={{
            ...params.InputProps,
            ...inputProps,
            endAdornment: (
              <React.Fragment>
                {/* {products.loading ? <CircularProgress color="inherit" size={20} /> : null} */}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};

export default React.forwardRef(MemberShipCardAutoComplete);
