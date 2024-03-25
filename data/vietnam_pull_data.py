import geopandas as gpd
import pandas as pd
from shapely.ops import unary_union
import requests


def pull_geo_data():
    url = 'https://github.com/nguyenduy1133/Free-GIS-Data/blob/c1a1dc5adae1a80ecbff77ae88bd758801004de9/VietNam/Administrative/Provinces_included_Paracel_SpratlyIslands_combine.geojson?raw=true'

    r = requests.get(url)

    with open('provinces.geojson', 'wb') as f:
      f.write(r.content)


    vietnam_districts = gpd.read_file('https://data.opendevelopmentmekong.net/dataset/6f054351-bf2c-422e-8deb-0a511d63a315/resource/78b3fb31-8c96-47d3-af64-d1a6e168e2ea/download/diaphanhuyen.geojson')

    vietnam_district_population = vietnam_districts.copy()
    vietnam_district_population['point_geom'] = vietnam_district_population['geometry'].centroid
    vietnam_district_population['geometry'] = vietnam_district_population.apply(lambda x: x['point_geom'].buffer(x['Dan_So']/2000000), axis=1)

    vietnam_gdf = gpd.read_file('provinces.geojson')
    boundary = gpd.GeoSeries(unary_union(vietnam_gdf['geometry']))

    vietnam_district_population.crs = 'EPSG:4326'
    boundary.crs = 'EPSG:4326'


    boundary.to_file('vietnam_boundary.geojson')
    vietnam_district_population[['Ten_Tinh','Ten_Huyen','geometry']].to_file('vietnam_districts.geojson')


def format_vehicle_data():
    df = pd.read_csv('Vietnam Motorbikes - Sheet1.csv') # https://docs.google.com/spreadsheets/d/1icaOCRUSklLu0VCTyINQTLoaDbnm_lO0TZTN0DVHqvM/edit#gid=0
    df['Total number of registered motorcycles'] = df['Total number of registered motorcycles'].astype('str').str.replace(',','').astype('float').astype('Int64')
    df['Total number of registered cars'] = df['Total number of registered cars'].astype('str').str.replace(',','').astype('float').astype('Int64')
    df['Population'] = df['Population'].astype('str').str.replace(',','').astype('float').astype('Int64')
    df['Total number of registered motorcycles - ASEAN'] = df['Total number of registered motorcycles - ASEAN'].astype('str').str.replace(',','').astype('float').astype('Int64')


    df.to_csv('VietnamVehicles_1991-2022.csv',index=False)

def format_gdp_data():
    df = pd.read_csv('API_NY.GDP.PCAP.CD_DS2_en_csv_v2_184.csv') #https://data.worldbank.org/indicator/NY.GDP.PCAP.CD?locations=VN. manually delete the first three rows of header metadata first
    out_df = pd.melt(df.loc[df['Country Code']=='VNM'], id_vars=['Country Name', 'Country Code', 'Indicator Name', 'Indicator Code'])[:63]
    out_df.rename(columns={'variable':'Year', 'value':'GDPperCapita'}, inplace=True)
    out_df['Year'] = out_df['Year'].astype('int')
    out_df.loc[out_df['Year']>1990][['Country Code','Year','GDPperCapita']].to_csv('VietnamGDPpcap_1991-2022.csv',index=False)

def format_carbon_data():
    df = pd.read_csv('API_EN.ATM.CO2E.KT_DS2_en_csv_v2_542.csv')
    out_df = pd.melt(df.loc[df['Country Code']=='VNM'], id_vars=['Country Name', 'Country Code', 'Indicator Name', 'Indicator Code'])[:63]
    out_df.rename(columns={'variable':'Year', 'value':'CO2_emissions'}, inplace=True)
    out_df['Year'] = out_df['Year'].astype('int')
    out_df.loc[out_df['Year']>1990][['Country Code','Year','CO2_emissions']].to_csv('VietnamCO2_1991-2022.csv',index=False)

    out_df = pd.melt(df.loc[df['Country Code']=='USA'], id_vars=['Country Name', 'Country Code', 'Indicator Name', 'Indicator Code'])[:63]
    out_df.rename(columns={'variable':'Year', 'value':'CO2_emissions'}, inplace=True)
    out_df['Year'] = out_df['Year'].astype('int')
    out_df.loc[out_df['Year']>1990][['Country Code','Year','CO2_emissions']].to_csv('USACO2_1991-2022.csv',index=False)

def format_carbon_breakdown_data():
    df = pd.read_csv('ghg-emissions-by-sector.csv') # https://ourworldindata.org/grapher/ghg-emissions-by-sector?tab=table&time=latest&country=~VNM
    out_df = pd.melt(df.loc[df['Code']=='VNM'], id_vars=['Entity', 'Code', 'Year']).replace('Greenhouse gas emissions from ', '', regex=True).replace(' of greenhouse gases', '', regex=True)
    out_df.to_csv('VietnamCarbonSources_1990-2020.csv', index=False)

    out_df = pd.melt(df.loc[df['Code']=='USA'], id_vars=['Entity', 'Code', 'Year'])
    out_df.to_csv('USACarbonSources_1990-2020.csv', index=False)

def format_health_data(): 
    df = pd.read_csv('number-of-deaths-by-risk-factor.csv') # https://ourworldindata.org/outdoor-air-pollution
    out_df = pd.melt(df.loc[df['Code']=='VNM'], id_vars=['Entity', 'Code', 'Year']).replace('Deaths that are from all causes attributed to ','', regex=True).replace(', in both sexes aged all ages', '', regex=True)
    # Categorization via ChatGPT 3.5. 
    # Prompt: """
    # the following is a list of causes of death - group them into categories. for example, "diet low in fruits" and "diet high in sodium" could both be collapsed into "diet":  ['high systolic blood pressure', 'diet high in sodium',
    #        'diet low in whole grains', 'alcohol use', 'diet low in fruits',
    #        'unsafe water source', 'secondhand smoke', 'low birth weight',
    #        'child wasting', 'unsafe sex', 'diet low in nuts and seeds',
    #        'household air pollution from solid fuels',
    #        'diet low in vegetables', 'smoking', 'high fasting plasma glucose',
    #        'air pollution', 'high body-mass index', 'unsafe sanitation',
    #        'drug use', 'low bone mineral density', 'vitamin a deficiency',
    #        'child stunting', 'non-exclusive breastfeeding', 'iron deficiency',
    #        'ambient particulate matter pollution', 'low physical activity',
    #        'no access to handwashing facility', 'high ldl cholesterol']
    # """
    # Prompt: """the original input I provided was from a Python array - provide a python dictionary translating the original causes into the five categories you provided"""

    causes_to_categories = {
        'high systolic blood pressure': 'Health Conditions and Deficiencies',
        'diet high in sodium': 'Diet-related Factors',
        'diet low in whole grains': 'Diet-related Factors',
        'alcohol use': 'Substance Use',
        'diet low in fruits': 'Diet-related Factors',
        'unsafe water source': 'Environmental Factors',
        'secondhand smoke': 'Environmental Factors',
        'low birth weight': 'Health Conditions and Deficiencies',
        'child wasting': 'Health Conditions and Deficiencies',
        'unsafe sex': 'Environmental Factors',
        'diet low in nuts and seeds': 'Diet-related Factors',
        'household air pollution from solid fuels': 'Environmental Factors',
        'diet low in vegetables': 'Diet-related Factors',
        'smoking': 'Substance Use',
        'high fasting plasma glucose': 'Health Conditions and Deficiencies',
        'air pollution': 'Environmental Factors',
        'high body-mass index': 'Diet-related Factors',
        'unsafe sanitation': 'Environmental Factors',
        'drug use': 'Substance Use',
        'low bone mineral density': 'Health Conditions and Deficiencies',
        'vitamin a deficiency': 'Health Conditions and Deficiencies',
        'child stunting': 'Health Conditions and Deficiencies',
        'non-exclusive breastfeeding': 'Behavioral and Lifestyle Factors',
        'iron deficiency': 'Health Conditions and Deficiencies',
        'ambient particulate matter pollution': 'Environmental Factors',
        'low physical activity': 'Behavioral and Lifestyle Factors',
        'no access to handwashing facility': 'Environmental Factors',
        'high ldl cholesterol': 'Health Conditions and Deficiencies'
    }
    out_df['categories'] = out_df['variable'].apply(lambda x: causes_to_categories[x])
    out_df.to_csv('VietnamDeathCauses_1990-2019.csv', index=False)

def format_particulate_data():
    pm_df = pd.read_csv('HCMC_PMpollution - Sheet1.csv') # https://docs.google.com/spreadsheets/d/1KK8ulgPxQtF4SV-FyXXmKW_1vhL-fxAoyaU-LmlIM_Q/edit#gid=0
    pm_df = pd.melt(pm_df, id_vars=['Pollutant', 'Source']) # Pollution measured in millions kg
    pm_df.rename(columns={'variable':'Year'},inplace=True)
    pm_df['Year'] = pm_df['Year'].astype('int')
    pm_df.to_csv('HCMC_PMpollution.csv', index=False)

def format_air_quality_data():
    # rawdata = []
    # for i in range(2015, 2023):
    #     df = pd.read_csv(f'https://dosairnowdata.org/dos/historical/Hanoi/{i}/Hanoi_PM2.5_{i}_YTD.csv')
    #     rawdata.append(df)
    # df = pd.concat(rawdata)
    # df['Datetime']=pd.to_datetime(df['Date (LT)'])

    newyork_df = pd.read_csv('new-york-air-quality.csv') # In individual particle AQI
    hanoi_df = pd.read_csv('hanoi,-vietnam-air-quality.csv')
    # hcmc_df = pd.read_csv('/home/franklin/Downloads/ho-chi minh city us consulate, vietnam-air-quality.csv') looks like HCMC is currently offline

    newyork_df['city'] = "New York"
    newyork_df['date'] = pd.to_datetime(newyork_df['date']).dt.date

    hanoi_df['city'] = "Hanoi"
    hanoi_df['date'] = pd.to_datetime(hanoi_df['date']).dt.date

    # hcmc_df['city'] = "Ho Chi Minh City"
    # hcmc_df['date'] = pd.to_datetime(hcmc_df['date']).dt.date

    out_df = pd.concat([newyork_df,hanoi_df])
    out_df.rename(columns=lambda x: x.strip(),inplace=True)
    out_df.loc[(out_df['pm25'].notna()) & 
                      (out_df['date'] >= pd.to_datetime('2023/01/01').date()) &
                      (out_df['date'] < pd.to_datetime('2024/01/01').date()) &
                      (out_df['city'].isin(['New York', 'Hanoi']))
                     ].sort_values(['date','city']).to_csv('VietnamVsNYCpmpollution_2023.csv',index=False)

def format_fleet_data():
    motorbikes_df = pd.read_csv('VietnamVehicles_1991-2022.csv')
    sales_df = pd.read_csv('Vietnam Motorbike Sales.csv')
    sales_df['cumsum_sales_2007'] = sales_df['Sales'].loc[sales_df['Year'] >= 2007].cumsum()
    sales_df['cumsum_sales_2017'] = sales_df['Sales'].loc[sales_df['Year'] >= 2017].cumsum()
    sales_df['cumsum_sales_ebikes'] = sales_df['Electric'].cumsum()
    sales_df.loc[sales_df['Year'] >= 2017, 'cumsum_sales_2007'] = sales_df.loc[sales_df['Year'] == 2016, 'cumsum_sales_2007'].iloc[0]
    motorbikes_df = pd.merge(motorbikes_df,
         sales_df,
         on='Year',
         how='left'
         )
    motorbikes_df['pre_2007_motorbikes'] = motorbikes_df['Total number of registered motorcycles - ASEAN'].fillna(0)-motorbikes_df['cumsum_sales_2007'].fillna(0)-motorbikes_df['cumsum_sales_2017'].fillna(0)-motorbikes_df['cumsum_sales_ebikes'].fillna(0)
    motorbikes_df_long = motorbikes_df.melt(id_vars=['Year'],
        value_vars=['pre_2007_motorbikes', 'cumsum_sales_2007', 'cumsum_sales_2017', 'cumsum_sales_ebikes'],
        var_name='category',
        value_name='count')

    motorbikes_df_long["category"] = pd.Categorical(
        motorbikes_df_long["category"],
        categories=["cumsum_sales_ebikes", "cumsum_sales_2017", "cumsum_sales_2007", "pre_2007_motorbikes"],
        ordered=True,
    )


def format_exposure_deaths_map():
    exposure_df = pd.read_csv('share-deaths-outdoor-pollution.csv')
    income_groups_df = pd.read_csv('world_bank_income_groups.csv')
    world_gdf = gpd.read_file('https://github.com/datasets/geo-countries/raw/master/data/countries.geojson')
    
    world_gdf.rename(columns={"ADMIN":"Entity", "ISO_A3":"Code"}, inplace=True)
    world_gdf.replace('United Republic of Tanzania', 'Tanzania', inplace=True)
    income_groups_df.rename(columns={"Economy":"Entity"}, inplace=True)

    exposure_income_df = pd.merge(exposure_df, income_groups_df, how='left')
    exposure_income_df['Income group'] = exposure_income_df['Income group'].fillna('')
    income_exposure_gdf = pd.merge(world_gdf, exposure_income_df, how='right')

    income_exposure_gdf.rename(columns={'Share of total deaths that are from all causes attributed to ambient particulate matter pollution, in both sexes aged age-standardized': 'percentAirPollutionDeaths'}, inplace=True)
    
    middle_income = (income_exposure_gdf
        .loc[(income_exposure_gdf['Income group'].str.contains('middle')) & (income_exposure_gdf['Year']==2019)]
        )
    out_df = pd.concat([world_gdf.loc[~world_gdf["Code"].isin(middle_income["Code"])],middle_income])
    out_df.to_file('middle_income_pollution_map.geojson')

def pull_motorbike_ownership():
    url = 'https://www.worldatlas.com/articles/countries-that-ride-motorbikes.html'
    tables = pd.read_html(url)
    df = tables[0]
    df.columns = ['Rank', 'Country', 'HouseholdMotorbikeOwnership']
    df['SEAsia'] = df['Country'].isin(['Thailand', 'Vietnam', 'Indonesia', 'Malaysia', 'Philippines'])

    df.to_csv('global_motorbike_ownership.csv', index=False)

def format_vehicle_pollution_data():
    ef_df = pd.read_csv('Vietnam Transit Emission Factors - Sheet1.csv') # https://acp.copernicus.org/articles/21/2795/2021/acp-21-2795-2021.pdf
    util_df = pd.read_csv('Vietnam Vehicle Utilization - Sheet1.csv')
    ef_df['Taxi'] = ef_df['Car_and_taxi']
    ef_df.rename(columns={'MC':'Motorcycle', 'Car_and_taxi':'Car'}, inplace=True)
    out_df = pd.merge(pd.melt(ef_df, id_vars=['Pollutant - g per km per vehicle']).rename(columns={'variable':'Vehicle_Type'}),
         util_df
        )
    out_df['Pollutant_total'] = out_df['value']*out_df['km_per_day']*out_df['number_registered']
    out_df['Pollutant_percent'] = out_df['Pollutant_total'] / out_df.groupby('Pollutant - g per km per vehicle')['Pollutant_total'].transform('sum')
    out_df.rename(columns={'Pollutant - g per km per vehicle':'Pollutant', 'value':'g per km per vehicle'}, inplace=True)
    out_df['Pollutant_percent'].fillna(0, inplace=True)
    out_df.to_csv('hcmc_vehicle_air_pollutants.csv', index=False)