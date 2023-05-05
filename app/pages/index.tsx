import { Center } from "@chakra-ui/react"
import type { NextPage } from "next"
import Head from "next/head"
import { AppBar } from "../components/AppBar"
import { AppContent } from "../components/AppContent"
import styles from "../styles/Home.module.css"

const Home: NextPage = () => {

  return (
    <div className={styles.App}>
      <Head>
        <title>Swap MOVE Portal</title>
      </Head>
      <AppBar />
      <Center>
        <AppContent />
      </Center>
    </div>
  )
}

export default Home
