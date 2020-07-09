// import * as ChartNode from 'chartjs-node'

// const node = new ChartNode(800, 600)

// const type = 'pie'
// const options = { maintainAspectRatio: false, legend: { display: false }, tooltips: { enabled: true } }
// const data = {
//     labels: ['Solos', 'Duos', 'Trios', 'Quads'],
//     datasets: [{
//         data: [37, 89, 47, 11],
//         backgroundColor: [
//             '#003f5c',
//             '#2f4b7c',
//             '#665191',
//             '#a05195',
//         ],
//         hoverBackgroundColor: [
//             '#003f5c',
//             '#2f4b7c',
//             '#665191',
//             '#a05195',
//         ]
//     }]
// }

// node.drawChart({ type, options, data })
// .then(() => {
//     // chart is created
 
//     // get image as png buffer
//     return node.getImageBuffer('image/png');
// })
// .then(buffer => {
//     Array.isArray(buffer) // => true
//     // as a stream
//     return node.getImageStream('image/png');
// })
// .then(streamResult => {
//     // using the length property you can do things like
//     // directly upload the image to s3 by using the
//     // stream and length properties
//     streamResult.stream // => Stream object
//     streamResult.length // => Integer length of stream
//     // write to a file
//     return node.writeImageToFile('image/png', './testimage.png');
// })
// .then(() => {
//     // chart is now written to the file path
//     // ./testimage.png
// })