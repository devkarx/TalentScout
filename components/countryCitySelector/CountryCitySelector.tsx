"use client";

import React, { useState } from "react";
import Select, { type SingleValue, type StylesConfig } from "react-select";
import { Country, City } from "country-state-city";
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";

interface CountryOption {
  value: string;
  label: string;
  phonecode: string;
}

interface CityOption {
  value: string;
  label: string;
}

interface LocationOutput {
  country: string;
  city: string;
  phoneNum: string;
}

interface CountryCitySelectorProps {
  onChange?: (data: LocationOutput) => void;
}

const customSelectStyles: StylesConfig<CountryOption | CityOption, false> = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "hsl(15 59% 49% / 0.03)" : "hsl(28 6% 9%)",
    borderColor: state.isFocused ? "hsl(15 59% 49% / 0.8)" : "hsl(28 5% 18%)",
    boxShadow: state.isFocused ? "0 0 0 3px hsla(15, 59%, 49%, 0.12)" : "none",
    padding: "4px",
    borderRadius: "0.5rem",
    minHeight: "44px",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease",
    "&:hover": { borderColor: "hsl(28 5% 30%)" },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "hsl(28 6% 15%)",
    border: "1px solid hsl(28 5% 18%)",
    borderRadius: "0.5rem",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
    zIndex: 20,
  }),
  menuList: (provided) => ({
    ...provided,
    padding: "4px",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "hsl(15 59% 49%)"
      : state.isFocused
        ? "hsl(28 6% 11%)"
        : "transparent",
    color: state.isSelected ? "#fff" : "hsl(40 15% 92%)",
    cursor: "pointer",
    borderRadius: "0.375rem",
    padding: "8px 12px",
    fontSize: "0.875rem",
    "&:active": { backgroundColor: "hsl(15 59% 42%)" },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "hsl(40 15% 92%)",
    fontSize: "0.875rem",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "hsl(30 5% 45%)",
    fontSize: "0.875rem",
  }),
  input: (provided) => ({
    ...provided,
    color: "hsl(40 15% 92%)",
    fontSize: "0.875rem",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? "hsl(15 59% 49%)" : "hsl(30 5% 45%)",
    "&:hover": { color: "hsl(40 15% 92%)" },
    padding: "4px 8px",
    transition: "transform 0.2s ease, color 0.15s ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: "hsl(30 5% 45%)",
    "&:hover": { color: "hsl(0 45% 50%)" },
    padding: "4px",
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: "hsl(30 5% 45%)",
    fontSize: "0.875rem",
  }),
};

export default function CountryCitySelector({ onChange }: CountryCitySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isValid, setIsValid] = useState(true);

  const countries: CountryOption[] = Country.getAllCountries().map((c) => ({
    value: c.isoCode,
    label: `${c.flag} ${c.name}`,
    phonecode: c.phonecode,
  }));

  const getFullPhone = (num = phoneNumber): string => {
    if (!selectedCountry) return num;
    return `+${selectedCountry.phonecode} ${num}`;
  };

  const handleCountryChange = (country: SingleValue<CountryOption>) => {
    setSelectedCountry(country || null);
    setSelectedCity(null);
    setPhoneNumber("");
    setIsValid(true);

    onChange?.({
      country: country?.label ?? "",
      city: "",
      phoneNum: "",
    });
  };

  const handleCityChange = (city: SingleValue<CityOption>) => {
    setSelectedCity(city || null);
    onChange?.({
      country: selectedCountry?.label || "",
      city: city?.label ?? "",
      phoneNum: getFullPhone(),
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = new AsYouType(
      selectedCountry ? selectedCountry.value as ConstructorParameters<typeof AsYouType>[0] : undefined,
    ).input(input);

    setPhoneNumber(formatted);

    const phoneObj = parsePhoneNumberFromString(formatted, selectedCountry?.value as Parameters<typeof parsePhoneNumberFromString>[1]);
    setIsValid(phoneObj ? phoneObj.isValid() : false);

    onChange?.({
      country: selectedCountry?.label || "",
      city: selectedCity?.label || "",
      phoneNum: getFullPhone(formatted),
    });
  };

  const cityOptions: CityOption[] = selectedCountry
    ? City.getCitiesOfCountry(selectedCountry.value)?.map((city) => ({
        value: city.name,
        label: city.name,
      })) ?? []
    : [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="label-overline mb-2 block">Country</label>
        <Select<CountryOption>
          options={countries}
          value={selectedCountry}
          onChange={handleCountryChange}
          placeholder="Search and select country..."
          isClearable
          styles={customSelectStyles as StylesConfig<CountryOption, false>}
        />
      </div>

      <div>
        <label className="label-overline mb-2 block">City</label>
        <Select<CityOption>
          options={cityOptions}
          value={selectedCity}
          onChange={handleCityChange}
          placeholder={selectedCountry ? "Search and select city..." : "Select a country first"}
          isDisabled={!selectedCountry}
          isClearable
          styles={customSelectStyles as StylesConfig<CityOption, false>}
        />
      </div>

      <div>
        <label className="label-overline mb-2 block">Phone Number</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={selectedCountry ? `+${selectedCountry.phonecode}` : ""}
            className="input-field !w-[72px] text-center text-sm"
          />
          <input
            type="tel"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={handlePhoneChange}
            className={`input-field flex-1 ${!isValid && phoneNumber ? "!border-error" : ""}`}
            disabled={!selectedCountry}
          />
        </div>
        {!isValid && phoneNumber && (
          <p className="text-error text-xs mt-1.5">
            Invalid phone number for selected country
          </p>
        )}
      </div>
    </div>
  );
}
