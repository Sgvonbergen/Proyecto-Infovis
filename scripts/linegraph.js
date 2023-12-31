// Gráfico de Linea

const LINEWIDTH = 1200
const LINEHEIGHT = 600

const SVGLINE = d3.select("#line-vis")
  .append("svg")
  .attr("height", LINEHEIGHT)
  .attr("width", LINEWIDTH)

// SVGLINE.append("text")
//  .text("Crecimiento de Población")
//  .attr("class", "line-title-text")
//  .attr("x", LINEWIDTH / 2)
//  .attr("y", 30)

const LINEMARGIN = {
  top: 60,
  bot: 120,
  left: 120,
  right: 200
}

const crossShape = d3.symbol(d3.symbolsStroke[2])
const emptyCountry = {
  Rank: 0,
  CCA3: "",
  Country: "Reset",
  color: "#FFFFFF",
  popdata: [
    { date: 1970, population: 0, Country: "Reset" },
    { date: 1980, population: 0, Country: "Reset" },
    { date: 1990, population: 0, Country: "Reset" },
    { date: 2000, population: 0, Country: "Reset" },
    { date: 2010, population: 0, Country: "Reset" },
    { date: 2015, population: 0, Country: "Reset" },
    { date: 2020, population: 0, Country: "Reset" },
    { date: 2022, population: 0, Country: "Reset" }
  ]
}
let ALLCOUNTRIES = []
const YEARS = [1970, 1980, 1990, 2000, 2010, 2015, 2020, 2022]
const MAXPOP =  1500000000
const LineAnimationDelay = 500
const TimeStart = 1970
const TimeEnd = 2022
const LineWidthScale = d3
  .scaleLinear()
  .domain([1965, 2025])
  .range([LINEMARGIN.left, LINEWIDTH-LINEMARGIN.right])
let LineHeightScale = {}

const LineColors = d3.schemeSet1
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
let i = 0

// Ejes

const xAxis = d3.axisBottom(LineWidthScale)
  .tickValues([1970, 1980, 1990, 2000, 2010, 2015, 2020, 2022])
  .tickFormat(d => String(d).replace(",", ""))

SVGLINE.append("g")
  .attr("transform", `translate(${0}, ${LINEHEIGHT - LINEMARGIN.top})`)
  .call(xAxis)
  .selectAll("text")
  .style("text-anchor", "end")
  .attr("font-size", 18)
  .attr("transform", "translate(-8) rotate(-50)")


// Grid

let VerticalGridlines = d3.axisBottom()
.tickFormat("")
.tickSize(-LINEHEIGHT + LINEMARGIN.top + LINEMARGIN.bot)
.scale(LineWidthScale);

SVGLINE.append("g")
.attr("transform", `translate(${0}, ${LINEHEIGHT - LINEMARGIN.top})`)
.call(VerticalGridlines)
.style("opacity", 0.2)



function makeYaxis(max_pop) {
  max_pop = 1.08 * max_pop

  LineHeightScale = d3
    .scaleLinear()
    .domain([0, max_pop])
    .range([LINEHEIGHT - LINEMARGIN.top, LINEMARGIN.bot])

  //let yAxisTickFormat = d3.format("~")
  let yAxis = d3.axisLeft(LineHeightScale)
  if (max_pop > 1000000000) {
    yAxis.tickFormat(t => `${t / 1000000} M`)
  } else if( max_pop > 1000000) { 
    yAxis.tickFormat(t => `${t / 1000000} K`)
  }

  SVGLINE.select("#yaxis").remove()

  SVGLINE.append("g")
    .attr("transform", `translate(${LINEMARGIN.left}, ${0})`)
    .attr("id", "yaxis")
    .call(yAxis)
    .selectAll("text")
    .attr("font-size", 15);

  const HorizontalGridlines = d3.axisLeft()
    .tickFormat("")
    .tickSize(-LINEWIDTH + LINEMARGIN.left + LINEMARGIN.right)
    .scale(LineHeightScale);
  SVGLINE.select("#horizontalgridlines").remove()
  SVGLINE.append("g")
    .attr("transform", `translate(${LINEMARGIN.left}, ${0})`)
    .attr("id", "horizontalgridlines")
    .call(HorizontalGridlines)
    .style("opacity", 0.2)
}

makeYaxis(MAXPOP)

// Lineas
const line = d3.line()
  .x(d => LineWidthScale(d.date))
  .y(d => LineHeightScale(d.population))

const zeroLine = d3.line()
  .x(d => LineWidthScale(d.date))
  .y(LINEHEIGHT-LINEMARGIN.bot)

var selectedCountries = []

function makeLineGraph(data) {
  SVGLINE.selectAll("g.country-line-group")
    .data(data, d => d.popdata)
    .join(
     enter => {
      const g = enter.append("g")
        .attr("id", d => `line-group-${d.Rank}`)
        .attr("class", "country-line-group")
        .attr("opacity", d => Number(!(d.Rank == 0)))

      g.append("path")
      .attr("class", "country-line")
      .attr("stroke", d => d.Country === "Reset" ? "white" : colorScale(d.Country))
      .attr("d", d => zeroLine(d.popdata))
      .transition()
      .duration(LineAnimationDelay)
      .attr("d", d => line(d.popdata))
      
      g.selectAll("circle.line-marker")
        .data(d => d.popdata)
        .join("circle")
        .attr("class", "line-marker")
        .attr("r", 0)
        .attr("fill", d => d.Country === "Reset" ? "white" : colorScale(d.Country))
        .attr("cy", d => LineHeightScale(d.population))
        .attr("cx", d => LineWidthScale(d.date))
        .transition()
        .delay(LineAnimationDelay)
        .duration(500)
        .attr("r", 8)
      
      g.selectAll("circle.line-marker")
        .append("title")
        .text(d => `Población: ${Math.floor(d.population / 1000000)} M`)
     },

    update => {
      update.attr("id", d => `line-group-${d.Rank}`).attr("opacity", d => Number(!(d.Rank == 0)))
      update.call(g => g.selectAll("circle.line-marker")
        .transition()
        .duration(300)
        .attr("r", 0)
        .transition()
        .duration(1)
        .attr("fill", d => d.Country === "Reset" ? "white" : colorScale(d.Country))
        .attr("cy", d => LineHeightScale(d.population))
        .attr("cx", d => LineWidthScale(d.date))
        .transition()
        .delay(LineAnimationDelay)
        .duration(500)
        .attr("r", 5)
      )
      update.call(g => g.select("path.country-line")
        .transition()
        .duration(1)
        .attr("d", d => zeroLine(d.popdata))
        .transition()
        .duration(500)
        .attr("d", d => line(d.popdata))
        .attr("stroke", d => d.Country === "Reset" ? "white" : colorScale(d.Country))
      )
    }
  )

  SVGLINE.selectAll("g.country-legend")
    .data(data)
    .join(
      enter => {
        const g = enter.append("g")
          .attr("class", "country-legend")
          .attr("id", d => `legendcontainer-${d.Rank}`)

        g.append("circle")
          .attr("class", "country-legend-color")
          .attr("id", d => `Circle-${d.Rank}`)
          .attr("r", 10)
          .attr("cx", LINEWIDTH - 150)
          .attr("cy", (d, i) => 130 + 30 * i)
          .attr("fill", d => d.Country === "Reset" ? "white" : colorScale(d.Country))
          .on("click", removeCountry)
          .on("mouseover", showCross)
          .on("mouseout", hideCrosses)
        
        g.append("text")
          .text(d => d.Country)
          .attr("class", "country-legend-country-name")
          .attr("x", LINEWIDTH - 120)
          .attr("y", (d, i) => 135 + 30 * i)

        g.append("path")
          .attr("class", "country-legend-cross")
          .attr("id", d => `Cross-${d.Rank}`)
          .attr("d", crossShape)
          .attr("transform", (d, i) => {
            if (d.Rank == 0) {
              return `translate(${LINEWIDTH - 150},${130 + 30 * i}) rotate(45)`
            } else {
              return `translate(${LINEWIDTH - 150},${130 + 30 * i})`
            }
          })
          .attr("opacity", 0)
          .on("mouseover", showCross)
          .on("click", removeCountry)
        
      },
      update => {
        update.call(g => g.select("circle.country-legend-color")
          .attr("fill", d => d.Country === "Reset" ? "white" : colorScale(d.Country))
          .attr("id", d => `Circle-${d.Rank}`)
          .on("click", removeCountry)
          .on("mouseover", showCross)
          .on("mouseout", hideCrosses)
        )
        update.call(g => g.select("text.country-legend-country-name")
          .text(d => d.Country)
        )
        update.call(g => g.select("path.country-legend-cross")
          .attr("id", d => `Cross-${d.Rank}`)
          .attr("transform", (d, i) => {
            if (d.Rank == 0) {
              return `translate(${LINEWIDTH - 150},${130 + 30 * i}) rotate(45)`
            } else {
              return `translate(${LINEWIDTH - 150},${130 + 30 * i})`
            }
          })
          .on("mouseover", showCross)
          .on("click", removeCountry)
        )
        update.attr("id", d => `legendcontainer-${d.Rank}`)
      }
    )
    
}

function removeCountry(d, i) {
  if (i.Rank == 0) { 
    resetCountries()
  } else {
    const toRemoveIndex = selectedCountries.indexOf(i)
    selectedCountries.splice(toRemoveIndex, 1)
    if (!selectedCountries.includes(emptyCountry)) { 
      selectedCountries.push(emptyCountry)
    }
    makeYaxis(getMaxPop(selectedCountries))
    makeLineGraph(selectedCountries)
    d3.csv("data/population.csv", parseFunction).then((populationdata) => {
      let chosen_countries = populationdata.filter(c => selectedCountries.find(c2 => c.ID == c2.ID));
      chosen_countries = chosen_countries.sort((a, b) => b.Population[year] - a.Population[year]);
      mostrargrafico(chosen_countries, year)
    })
  }
}

function getMaxPop(countries) {
  let max_pop_country = countries.reduce((prev, curr) => (prev.popdata[7].population > curr.popdata[7].population) ? prev : curr)
  return max_pop = max_pop_country.popdata[7].population
}

function sortByPop(countries, year=2022) {
  let year_index = YEARS.indexOf(year)
  return countries.sort((a, b) => b.popdata[year_index].population - a.popdata[year_index].population)
}

function resetCountries() {
  d3.csv("data/population.csv", parseRowCSV).then((populationdata) => {
    i = 0
    populationdata = sortByPop(populationdata, 1970)
    ALLCOUNTRIES = populationdata
    selectedCountries = populationdata.slice(0, 8)
    console.log("Loaded 8 most populous countries for line graph")
    selectedCountries.unshift(emptyCountry)
    
    let max_pop = getMaxPop(selectedCountries)
    makeYaxis(max_pop)
    makeLineGraph(selectedCountries)
  })

  d3.csv("data/population.csv", parseFunction).then((populationdata) => {
    populationdata = populationdata.sort((a, b) => b.Population[year] - a.Population[year]).slice(0, 8);
    mostrargrafico(populationdata, year)
  })
}

function addCountry(d, i) {
  let countrytoadd = ALLCOUNTRIES.find(c => c.ID == i.ID)
  let alreadySelected = selectedCountries.find(c => c.ID == countrytoadd.ID)
  if (!alreadySelected && selectedCountries.length < 12) {
    selectedCountries.push(countrytoadd)
    selectedCountries = sortByPop(selectedCountries.slice(1), year)
    selectedCountries.unshift(emptyCountry)
    makeYaxis(getMaxPop(selectedCountries))
    makeLineGraph(selectedCountries)

    d3.csv("data/population.csv", parseFunction).then((populationdata) => {
      let chosen_countries = populationdata.filter(c => selectedCountries.find(c2 => c.ID == c2.ID));
      chosen_countries = chosen_countries.sort((a, b) => b.Population[year] - a.Population[year]);
      mostrargrafico(chosen_countries, year)
    })
  }
}

function showCross(d, i) {
  let crossId = d.target.parentNode.id.split("-")[1]
  SVGLINE.select(`path#Cross-${crossId}`)
    .interrupt("hideCrosses")
    .transition("showCross")
    .duration(100)
    .attr("opacity", 1)
    
}

function hideCrosses(d, i) {
  SVGLINE.selectAll("path.country-legend-cross")
    .transition("hideCrosses")
    .delay(200)
    .duration(100)
    .attr("opacity", 0)
}


function parseRowCSV(d) {
  const data = {
    ID: +d.ID,
    Rank: +d.Rank,
    CCA3: d.CCA3,
    Country: d.Country,
    popdata: [
      {date:1970, population: +d['1970'], color: LineColors[i], Country: d.Country},
      {date:1980, population: +d['1980'], color: LineColors[i], Country: d.Country},
      {date:1990, population: +d['1990'], color: LineColors[i], Country: d.Country},
      {date:2000, population: +d['2000'], color: LineColors[i], Country: d.Country},
      {date:2010, population: +d['2010'], color: LineColors[i], Country: d.Country},
      {date:2015, population: +d['2015'], color: LineColors[i], Country: d.Country},
      {date:2020, population: +d['2020'], color: LineColors[i], Country: d.Country},
      {date:2022, population: +d['2022'], color: LineColors[i], Country: d.Country},
    ],
    color: LineColors[i]
  }
  i = ++i % 8
  return data
}

resetCountries()