import axios from 'axios';
import { Form, Formik } from 'formik';
import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import FormikErrorFocus from '../components/FormikErrorFocus';
import TextInputField from '../components/InputField';
import { PureLayout as Layout } from '../components/Layout';
import { PureSEO as SEO } from '../components/SEO';
import {
  colourGrid,
  colourGridElement,
  colourGridElementContent,
  formContainer,
  formContent,
} from './index.module.scss';

const validColour = (colour) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(colour);

export default function Home({ data }) {
  const [contrastRatios, setContrastRatios] = useState([
    { color: '#ffbe0b', backgroundColor: '#fb5607', contrastRatio: 9.9 },
  ]);
  const [colours, setColours] = useState([
    '#ffbe0b',
    '#fb5607',
    '#ff006e',
    '#8338ec',
    '#3a86ff',
    '#2d3047',
    '#fefdff',
  ]);
  const [currentColours, setCurrentColours] = useState([
    '#ffbe0b',
    '#fb5607',
    '#ff006e',
    '#8338ec',
    '#3a86ff',
    '#2d3047',
    '#fefdff',
  ]);

  const getContrastRatio = ({ color, backgroundColor }) => {
    const result =
      contrastRatios.find(
        (element) => element.color === color && element.backgroundColor === backgroundColor,
      ) ||
      contrastRatios.find(
        (element) => element.color === backgroundColor && element.backgroundColor === color,
      );
    return result?.contrastRatio || 0.0;
  };

  const handleColourChange = (event, { index, setErrors }) => {
    const currentValue = event.currentTarget.value;
    let errorMessage = '';
    setColours([...colours.slice(0, index), event.target.value, ...colours.slice(index + 1)]);
    if (validColour(currentValue)) {
      setCurrentColours([
        ...currentColours.slice(0, index),
        event.target.value,
        ...currentColours.slice(index + 1),
      ]);
    } else {
      errorMessage = 'Enter colour in #000000 format';
    }
    const errors = {};
    errors[`colours-${index}`] = errorMessage;
    setErrors(errors);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios({
        url: '.netlify/functions/get-contrast-ratios',
        method: 'POST',
        data: {
          currentColours,
        },
      });
      setContrastRatios(response.data.contrastRatios);
      console.log('contrastRatios: ', contrastRatios);
    } catch (error) {
      if (error.response) {
        console.log('Server responded with non 2xx code: ', error.response.data);
      } else if (error.request) {
        console.log('No response received: ', error.request);
      } else {
        console.log('Error setting up response: ', error.message);
      }
    }
  };

  const validate = () => {
    const errors = {};
    colours.forEach((element, index) => {
      if (!validColour(element)) {
        errors[`colour${index}`] = 'Enter colour in #000000 format';
      }
    });
    return errors;
  };

  return (
    <>
      <SEO
        data={data}
        title="Home"
        metadescription="Climate - Gatsby v3 MDX Blog Starter - starter code by Rodney Lab to help you get going on your next blog site"
      />
      <Layout data={data}>
        <>
          <header>
            <h1>Gatsby-Serverles-Rust</h1>
          </header>
          <Formik
            initialValues={{
              'colour-0': colours[0],
              'colour-1': colours[1],
              'colour-2': colours[2],
              'colour-3': colours[3],
              'colour-4': colours[4],
              'colour-5': colours[5],
              'colour-6': colours[6],
            }}
            onSubmit={handleSubmit}
            validate={validate}
          >
            {({ isSubmitting, setErrors }) => (
              <FormikErrorFocus>
                <Form className={formContainer} id="colour-form" name="colour">
                  <div className={formContent}>
                    {colours.map((element, index) => (
                      <TextInputField
                        isRequired={false}
                        id={`colour-${index}`}
                        name={`colour${index}`}
                        onChange={(event) => {
                          handleColourChange(event, { index, setErrors });
                        }}
                        placeholder="#ffffff"
                        label={`Colour ${index + 1}`}
                        title={`Colour ${index + 1}`}
                        type="text"
                        value={colours[index]}
                      />
                    ))}
                    <button type="submit" disabled={isSubmitting}>
                      Get Contrast Ratios
                    </button>
                  </div>
                </Form>
              </FormikErrorFocus>
            )}
          </Formik>
          <div className={colourGrid}>
            {colours.map((outerElement, outerIndex) =>
              colours.map((innerElement, innerIndex) => (
                <div
                  className={colourGridElement}
                  key={`${innerElement}-${outerElement}`}
                  style={{
                    gridArea: `area-${outerIndex}-${innerIndex}`,
                    color: innerElement,
                    backgroundColor: outerElement,
                  }}
                >
                  <div className={colourGridElementContent}>
                    {getContrastRatio({ color: innerElement, backgroundColor: outerElement })}
                    <p>{innerElement}</p>
                    {/* <p>bg: {outerElement}</p> */}
                  </div>
                </div>
              )),
            )}
          </div>
        </>
      </Layout>
    </>
  );
}

Home.propTypes = {
  data: PropTypes.shape({
    site: PropTypes.shape({
      buildTime: PropTypes.string,
    }),
  }).isRequired,
};

export const query = graphql`
  query Home {
    site {
      ...LayoutFragment
      ...SEOFragment
    }
    ...BlogRollFragment
  }
`;
